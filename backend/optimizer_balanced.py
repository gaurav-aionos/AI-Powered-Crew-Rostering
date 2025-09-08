import random
import pandas as pd
import numpy as np
from collections import defaultdict

class CoverageOptimizer:
    def __init__(self, data_loader, rule_engine):
        self.data = data_loader
        self.rule_engine = rule_engine
        
    def generate_max_coverage_roster(self):
        """Generate roster with maximum coverage while maintaining reasonable compliance"""
        roster_entries = []
        crew_duty_tracker = defaultdict(float)
        covered_flights = set()
        
        # KEY INSIGHT: Sort flights by required crew (fewer crew = easier to cover)
        flights_with_requirements = self.data.flights.copy()
        flights_with_requirements['total_crew_required'] = (
            flights_with_requirements['pilots_required'] + 
            flights_with_requirements['cabin_crew_required']
        )
        sorted_flights = flights_with_requirements.sort_values('total_crew_required')
        
        print("🔄 Phase 1: Cover flights requiring least crew first...")
        for _, flight in sorted_flights.iterrows():
            if flight['flight_id'] in covered_flights:
                continue
                
            flight_assignments = []
            success = self.try_assign_easy(flight, flight_assignments, crew_duty_tracker)
            
            if success:
                roster_entries.extend(flight_assignments)
                covered_flights.add(flight['flight_id'])
                for assignment in flight_assignments:
                    crew_duty_tracker[assignment['crew_id']] += assignment['duty_hours']
        
        phase1_coverage = len(covered_flights)
        print(f"Phase 1: Covered {phase1_coverage} flights (easiest first)")
        
        print("🔄 Phase 2: Cover remaining flights with relaxed constraints...")
        # Use crew who are still underutilized (<8 hours)
        underutilized_crew = [crew_id for crew_id, hours in crew_duty_tracker.items() if hours < 8]
        print(f"Underutilized crew available: {len(underutilized_crew)}")
        
        remaining_flights = sorted_flights[~sorted_flights['flight_id'].isin(covered_flights)]
        
        for _, flight in remaining_flights.iterrows():
            if flight['flight_id'] in covered_flights:
                continue
                
            flight_assignments = []
            success = self.try_assign_with_crew_pool(flight, flight_assignments, crew_duty_tracker, underutilized_crew, 14.0)
            
            if success:
                roster_entries.extend(flight_assignments)
                covered_flights.add(flight['flight_id'])
                for assignment in flight_assignments:
                    crew_id = assignment['crew_id']
                    crew_duty_tracker[crew_id] += assignment['duty_hours']
                    # Update underutilized pool
                    if crew_id in underutilized_crew and crew_duty_tracker[crew_id] >= 8:
                        underutilized_crew.remove(crew_id)
        
        phase2_coverage = len(covered_flights)
        print(f"Phase 2: Covered {phase2_coverage - phase1_coverage} additional flights")
        
        print("🔄 Phase 3: Final push for maximum coverage...")
        # For remaining flights, be more aggressive but within 16h limit
        final_flights = sorted_flights[~sorted_flights['flight_id'].isin(covered_flights)]
        
        for _, flight in final_flights.iterrows():
            if flight['flight_id'] in covered_flights:
                continue
                
            flight_assignments = []
            success = self.try_assign_aggressive(flight, flight_assignments, crew_duty_tracker, 16.0)
            
            if success:
                roster_entries.extend(flight_assignments)
                covered_flights.add(flight['flight_id'])
                for assignment in flight_assignments:
                    crew_duty_tracker[assignment['crew_id']] += assignment['duty_hours']
        
        final_coverage = len(covered_flights)
        print(f"Final: Covered {final_coverage}/120 flights ({final_coverage/120:.1%})")
        
        return pd.DataFrame(roster_entries), dict(crew_duty_tracker)
    
    def try_assign_easy(self, flight, flight_assignments, crew_duty_tracker):
        """Easy assignment with base matching and 12h limit"""
        return self.try_assign_crew(flight, flight_assignments, crew_duty_tracker, 12.0, True)
    
    def try_assign_aggressive(self, flight, flight_assignments, crew_duty_tracker, max_hours):
        """Aggressive assignment with flexible base matching"""
        return self.try_assign_crew(flight, flight_assignments, crew_duty_tracker, max_hours, False)
    
    def try_assign_crew(self, flight, flight_assignments, crew_duty_tracker, max_hours, require_base_match):
        """Generic crew assignment"""
        # Assign pilots
        pilots_assigned = self.assign_pilots(flight, flight_assignments, crew_duty_tracker, max_hours, require_base_match)
        if pilots_assigned < flight['pilots_required']:
            return False
        
        # Assign cabin crew
        cabin_assigned = self.assign_cabin_crew(flight, flight_assignments, crew_duty_tracker, max_hours, require_base_match)
        if cabin_assigned < flight['cabin_crew_required']:
            return False
        
        return True
    
    def try_assign_with_crew_pool(self, flight, flight_assignments, crew_duty_tracker, crew_pool, max_hours):
        """Assign using specific crew pool"""
        crew_pool_set = set(crew_pool)
        
        # Get available pilots from pool
        available_pilots = self.get_available_crew(
            flight, ['Captain', 'First Officer'], crew_duty_tracker, max_hours, False
        )
        available_pilots = available_pilots[available_pilots['crew_id'].isin(crew_pool_set)]
        
        # Get available cabin crew from pool
        available_cabin = self.get_available_crew(
            flight, ['Senior Crew', 'Crew Member', 'Trainee'], crew_duty_tracker, max_hours, False
        )
        available_cabin = available_cabin[available_cabin['crew_id'].isin(crew_pool_set)]
        
        # Assign pilots
        pilots_assigned = 0
        required_pilots = flight['pilots_required']
        
        if not available_pilots.empty and len(available_pilots) >= required_pilots:
            if required_pilots == 2:
                captains = available_pilots[available_pilots['role'] == 'Captain']
                fos = available_pilots[available_pilots['role'] == 'First Officer']
                if len(captains) >= 1 and len(fos) >= 1:
                    captain = captains.sample(1).iloc[0]
                    fo = fos.sample(1).iloc[0]
                    flight_assignments.extend([
                        self.create_assignment(flight, captain, 'Captain'),
                        self.create_assignment(flight, fo, 'First Officer')
                    ])
                    pilots_assigned = 2
            else:
                pilot = available_pilots.sample(1).iloc[0]
                flight_assignments.append(self.create_assignment(flight, pilot, pilot['role']))
                pilots_assigned = 1
        
        if pilots_assigned < required_pilots:
            return False
        
        # Assign cabin crew
        required_cabin = flight['cabin_crew_required']
        if not available_cabin.empty and len(available_cabin) >= required_cabin:
            selected = available_cabin.sample(required_cabin)
            for _, crew_member in selected.iterrows():
                flight_assignments.append(self.create_assignment(flight, crew_member, crew_member['role']))
            return True
        
        return False
    
    def assign_pilots(self, flight, flight_assignments, crew_duty_tracker, max_hours, require_base_match):
        """Assign pilots to flight"""
        available_pilots = self.get_available_crew(
            flight, ['Captain', 'First Officer'], crew_duty_tracker, max_hours, require_base_match
        )
        
        if available_pilots.empty:
            return 0
            
        required = flight['pilots_required']
        
        if len(available_pilots) >= required:
            if required == 2:
                captains = available_pilots[available_pilots['role'] == 'Captain']
                fos = available_pilots[available_pilots['role'] == 'First Officer']
                if len(captains) >= 1 and len(fos) >= 1:
                    captain = captains.sample(1).iloc[0]
                    fo = fos.sample(1).iloc[0]
                    flight_assignments.extend([
                        self.create_assignment(flight, captain, 'Captain'),
                        self.create_assignment(flight, fo, 'First Officer')
                    ])
                    return 2
            else:
                pilot = available_pilots.sample(1).iloc[0]
                flight_assignments.append(self.create_assignment(flight, pilot, pilot['role']))
                return 1
        
        return 0
    
    def assign_cabin_crew(self, flight, flight_assignments, crew_duty_tracker, max_hours, require_base_match):
        """Assign cabin crew to flight"""
        available_cabin = self.get_available_crew(
            flight, ['Senior Crew', 'Crew Member', 'Trainee'], crew_duty_tracker, max_hours, require_base_match
        )
        
        if available_cabin.empty:
            return 0
            
        required = flight['cabin_crew_required']
        
        if len(available_cabin) >= required:
            selected = available_cabin.sample(required)
            for _, crew_member in selected.iterrows():
                flight_assignments.append(self.create_assignment(flight, crew_member, crew_member['role']))
            return required
        
        return 0
    
    def get_available_crew(self, flight, roles, crew_duty_tracker, max_hours, require_base_match):
        """Get available crew considering duty hours"""
        try:
            if require_base_match:
                base_crew = self.data.get_crew_by_role(role=roles, base=flight['origin'], status='ACTIVE')
            else:
                base_crew = self.data.crew[
                    (self.data.crew['role'].isin(roles)) & 
                    (self.data.crew['status'] == 'ACTIVE')
                ]
            
            if base_crew.empty:
                return pd.DataFrame()
            
            available_crew = []
            for _, crew_member in base_crew.iterrows():
                crew_id = crew_member['crew_id']
                current_duty = crew_duty_tracker.get(crew_id, 0)
                flight_duration = flight['flight_duration_hours']
                
                duty_buffer = 0.5 if crew_member['role'] in ['Captain', 'First Officer'] else 0.3
                proposed_duty = current_duty + flight_duration + duty_buffer
                
                if proposed_duty <= max_hours:
                    available_crew.append(crew_member)
            
            return pd.DataFrame(available_crew)
            
        except Exception as e:
            print(f"Error getting available crew: {e}")
            return pd.DataFrame()
    
    def create_assignment(self, flight, crew_member, role):
        """Create assignment record"""
        duty_buffer = 0.5 if role in ['Captain', 'First Officer'] else 0.3
        
        return {
            'flight_id': flight['flight_id'],
            'crew_id': crew_member['crew_id'],
            'role': role,
            'duty_hours': flight['flight_duration_hours'] + duty_buffer
        }