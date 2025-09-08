from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import pandas as pd
import json
from typing import Dict, List, Any
import os
import numpy as np


from config import *
from core.data_loader import DataLoader
from core.rule_engine import RuleEngine
from core.optimizer import GeneticOptimizer

app = FastAPI(title="IndiGo Crew Rostering API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to store data
data_loader = None
rule_engine = None
optimizer = None
current_roster = None

@app.on_event("startup")
async def startup_event():
    """Initialize the AI system on startup"""
    global data_loader, rule_engine, optimizer
    try:
        data_loader = DataLoader()
        data_loader.load_all_data(
            INPUT_FLIGHTS_PATH,
            INPUT_CREW_PATH,
            INPUT_PREFERENCES_PATH,
            INPUT_DGCA_RULES_PATH,
            INPUT_HISTORICAL_PATH
        )
        rule_engine = RuleEngine(data_loader)
        optimizer = GeneticOptimizer(data_loader, rule_engine)
        print("✅ AI System initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize AI system: {e}")

@app.get("/")
async def root():
    return {"message": "IndiGo Crew Rostering API", "status": "active"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "initialized": data_loader is not None}

@app.post("/api/generate-roster")
async def generate_roster():
    """Generate a new optimized roster"""
    global current_roster
    try:
        if optimizer is None:
            raise HTTPException(status_code=500, detail="AI system not initialized")
        
        roster = optimizer.generate_random_roster()
        if roster is None or roster.empty:
            raise HTTPException(status_code=500, detail="Failed to generate roster")
        
        current_roster = roster
        roster.to_csv(OUTPUT_BASE_ROSTER_PATH, index=False)
        
        # Calculate metrics
        metrics = calculate_roster_metrics(roster)
        
        return {
            "message": "Roster generated successfully",
            "metrics": metrics,
            "roster_size": len(roster)
        }
    except Exception as e:
        import traceback, sys
        print("❌ Full traceback in generate_roster:")
        traceback.print_exc(file=sys.stdout)
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/roster")
async def get_roster():
    """Get the current roster data"""
    if current_roster is None:
        raise HTTPException(status_code=404, detail="No roster available. Generate one first.")
    
    try:
        # Convert roster to JSON format
        roster_data = current_roster.to_dict(orient='records')
        metrics = calculate_roster_metrics(current_roster)
        
        return {
            "roster": roster_data,
            "metrics": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/roster/flights")
async def get_flights():
    """Get all flights with crew assignments"""
    if current_roster is None:
        raise HTTPException(status_code=404, detail="No roster available")
    
    try:
        flights_data = []
        for flight_id, assignments in current_roster.groupby('flight_id'):
            flight_info = data_loader.flights[data_loader.flights['flight_id'] == flight_id].iloc[0].to_dict()
            flights_data.append({
                "flight_id": flight_id,
                "origin": flight_info['origin'],
                "destination": flight_info['destination'],
                "aircraft_type": flight_info['aircraft_type'],
                "departure_time": flight_info['departure_time'],
                "assignments": assignments.to_dict(orient='records')
            })
        
        return {"flights": flights_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/disrupt/{crew_id}/{flight_id}")
async def simulate_disruption(crew_id: str, flight_id: str):
    """Simulate a disruption and recover"""
    global current_roster   # ✅ moved to the top
    
    if current_roster is None:
        raise HTTPException(status_code=404, detail="No roster available")
    
    try:
        # Create disrupted roster
        disrupted_roster = current_roster[
            ~((current_roster['flight_id'] == flight_id) & 
              (current_roster['crew_id'] == crew_id))
        ].copy()
        
        # Re-optimize
        optimizer.create_initial_population(POPULATION_SIZE)
        recovered_roster, recovery_score = optimizer.run_optimization(GENERATIONS // 2)

        
        if recovered_roster is not None:
            current_roster = recovered_roster
            recovered_roster.to_csv(OUTPUT_RECOVERED_ROSTER_PATH, index=False)
            
            return {
                "message": "Disruption handled successfully",
                "removed_crew": crew_id,
                "affected_flight": flight_id,
                "recovery_score": recovery_score,
                "new_metrics": calculate_roster_metrics(recovered_roster)
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to recover from disruption")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats")
async def get_system_stats():
    """Get system statistics and metrics with numpy type conversion"""
    if data_loader is None:
        raise HTTPException(status_code=500, detail="System not initialized")
    
    try:
        # Convert numpy types to native Python types
        def convert_numpy_types(obj):
            if isinstance(obj, (np.integer, np.floating)):
                return obj.item()
            elif isinstance(obj, np.ndarray):
                return obj.tolist()
            elif isinstance(obj, dict):
                return {k: convert_numpy_types(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_numpy_types(item) for item in obj]
            else:
                return obj
        
        stats = {
            "total_flights": int(len(data_loader.flights)),
            "total_crew": int(len(data_loader.crew)),
            "active_crew": int(len(data_loader.crew[data_loader.crew['status'] == 'ACTIVE'])),
            "crew_by_role": convert_numpy_types(data_loader.crew['role'].value_counts().to_dict()),
            "flights_by_aircraft": convert_numpy_types(data_loader.flights['aircraft_type'].value_counts().to_dict()),
            "flights_by_origin": convert_numpy_types(data_loader.flights['origin'].value_counts().to_dict())
        }
        
        if current_roster is not None:
            stats["current_roster"] = calculate_roster_metrics(current_roster)
        
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/download-roster")
async def download_roster():
    """Download the current roster as CSV"""
    if current_roster is None:
        raise HTTPException(status_code=404, detail="No roster available")
    
    try:
        # Merge with flight data to include origin, destination, aircraft_type in the CSV
        merged_roster = current_roster.merge(
            data_loader.flights[['flight_id', 'origin', 'destination', 'aircraft_type']],
            on='flight_id',
            how='left'
        )
        
        merged_roster.to_csv(OUTPUT_BASE_ROSTER_PATH, index=False)
        
        return FileResponse(
            OUTPUT_BASE_ROSTER_PATH,
            media_type='text/csv',
            filename="indigo_crew_roster.csv"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/roster-metrics")
async def get_roster_metrics():
    """Get comprehensive metrics and flight details for the current roster"""
    if current_roster is None:
        raise HTTPException(status_code=404, detail="No roster available")
    
    try:
        metrics = calculate_roster_metrics(current_roster)
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/roster/violation-breakdown")
async def get_violation_breakdown():
    """Get categorized violation breakdown"""
    if rule_engine is None:
        raise HTTPException(status_code=500, detail="Rule engine not initialized")
    
    try:
        breakdown = rule_engine.get_violation_breakdown()
        return breakdown
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
def calculate_roster_metrics(roster: pd.DataFrame) -> Dict[str, Any]:
    """Calculate comprehensive roster metrics with flight details and numpy type conversion"""
    if roster is None or roster.empty:
        return {}
    
    # Convert numpy types to native Python types for JSON serialization
    def convert_numpy_types(obj):
        if isinstance(obj, (np.integer, np.floating)):
            return obj.item()  # Convert numpy numbers to Python numbers
        elif isinstance(obj, np.ndarray):
            return obj.tolist()  # Convert numpy arrays to lists
        elif isinstance(obj, dict):
            return {k: convert_numpy_types(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert_numpy_types(item) for item in obj]
        else:
            return obj
    
    # Get flight details for the frontend
    flight_details = []
    if not roster.empty:
        # Merge with flights data to get origin, destination, and aircraft type
        merged_data = roster.merge(
            data_loader.flights[['flight_id', 'origin', 'destination', 'aircraft_type']],
            on='flight_id',
            how='left'
        )
        
        # Get unique flight details for the frontend
        flight_details = merged_data[['flight_id', 'origin', 'destination', 'aircraft_type']].drop_duplicates().to_dict('records')
    
    crew_hours = roster.groupby('crew_id')['duty_hours'].sum()
    
    metrics = {
        "total_assignments": len(roster),
        "covered_flights": roster['flight_id'].nunique(),
        "total_flights": len(data_loader.flights),
        "coverage_percentage": float((roster['flight_id'].nunique() / len(data_loader.flights)) * 100),
        "crew_utilized": roster['crew_id'].nunique(),
        "total_crew": len(data_loader.crew),
        "utilization_percentage": float((roster['crew_id'].nunique() / len(data_loader.crew)) * 100),
        "max_duty_hours": float(crew_hours.max()) if not crew_hours.empty else 0.0,
        "avg_duty_hours": float(crew_hours.mean()) if not crew_hours.empty else 0.0,
        "crew_over_12h": int((crew_hours > 12).sum()),
        "crew_over_14h": int((crew_hours > 14).sum()),
        "duplicate_assignments": int(roster.duplicated(subset=['flight_id', 'crew_id']).sum()),
        "violations": len(rule_engine.check_roster_compliance(roster)) if rule_engine else 0,
        # New fields for frontend
        "flight_details": flight_details,
        "aircraft_types_covered": list(roster.merge(
            data_loader.flights[['flight_id', 'aircraft_type']],
            on='flight_id',
            how='left'
        )['aircraft_type'].unique()) if not roster.empty else []
    }
    
    # Convert any numpy types in the metrics
    return convert_numpy_types(metrics)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)