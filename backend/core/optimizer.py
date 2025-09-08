import random
import pandas as pd
import numpy as np
from collections import defaultdict

class GeneticOptimizer:
    def __init__(self, data_loader, rule_engine):
        self.data = data_loader
        self.rule_engine = rule_engine
        self.population = []
        2
    def generate_random_roster(self):
        """Generate roster with maximum coverage while maintaining compliance"""
        roster_entries = []
        crew_duty_tracker = defaultdict(float)
        covered_flights = set()
        
        # Sort flights by required crew (fewer crew = easier to cover)
        flights_with_requirements = self.data.flights.copy()
        flights_with_requirements['total_crew_required'] = (
            flights_with_requirements['pilots_required'] + 
            flights_with_requirements['cabin_crew_required']
        )
        sorted_flights = flights_with_requirements.sort_values('total_crew_required')
       
        print("Phase 1: Cover flights requiring least crew first (12h limit)...")
        for _, flight in sorted_flights.iterrows():
            if flight['flight_id'] in covered_flights:
                continue
                
            flight_assignments = []
            success = self.try_assign_crew(flight, flight_assignments, crew_duty_tracker, 12.0, True)
            
            if success:
                roster_entries.extend(flight_assignments)
                covered_flights.add(flight['flight_id'])
                for assignment in flight_assignments:
                    crew_duty_tracker[assignment['crew_id']] += assignment['duty_hours']
        
        phase1_coverage = len(covered_flights)
        print(f"  Covered {phase1_coverage} flights")
        
        print("Phase 2: Cover more flights with underutilized crew (14h limit)...")
        underutilized_crew = [crew_id for crew_id, hours in crew_duty_tracker.items() if hours < 8]
        print(f"  Underutilized crew available: {len(underutilized_crew)}")
        
        for _, flight in sorted_flights.iterrows():
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
                    if crew_id in underutilized_crew and crew_duty_tracker[crew_id] >= 8:
                        underutilized_crew.remove(crew_id)
        
        phase2_coverage = len(covered_flights)
        print(f"  Covered {phase2_coverage - phase1_coverage} additional flights")
        
        print("Phase 3: Final push for maximum coverage (16h limit)...")
        remaining_flights = sorted_flights[~sorted_flights['flight_id'].isin(covered_flights)]
        
        for _, flight in remaining_flights.iterrows():
            if flight['flight_id'] in covered_flights:
                continue
                
            flight_assignments = []
            success = self.try_assign_crew(flight, flight_assignments, crew_duty_tracker, 16.0, False)
            
            if success:
                roster_entries.extend(flight_assignments)
                covered_flights.add(flight['flight_id'])
                for assignment in flight_assignments:
                    crew_duty_tracker[assignment['crew_id']] += assignment['duty_hours']
        
        final_coverage = len(covered_flights)
        print(f"Final: Covered {final_coverage}/120 flights ({final_coverage/120:.1%})")
        
        return pd.DataFrame(roster_entries)
    
    def try_assign_crew(self, flight, flight_assignments, crew_duty_tracker, max_hours, require_base_match):
        """Try to assign crew to a flight"""
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
        """Create assignment record with time information"""
        duty_buffer = 0.5 if role in ['Captain', 'First Officer'] else 0.3
        
        return {
            'flight_id': flight['flight_id'],
            'crew_id': crew_member['crew_id'],
            'role': role,
            'duty_hours': flight['flight_duration_hours'] + duty_buffer,
            'departure_time': flight['departure_time'],  # Added time info
            'arrival_time': flight['arrival_time']       # Added time info
        }
    
    def calculate_fitness(self, roster_df):
        """Fitness function for genetic algorithm"""
        if roster_df is None or roster_df.empty:
            return -10000
        
        score = 1000
        
        # Coverage is most important
        covered_flights = roster_df['flight_id'].nunique()
        total_flights = len(self.data.flights)
        coverage_ratio = covered_flights / total_flights
        score += coverage_ratio * 3000
        
        # Check duty hour compliance
        crew_hours = roster_df.groupby('crew_id')['duty_hours'].sum()
        duty_violations = (crew_hours > 14).sum() * 100 + (crew_hours > 12).sum() * 50
        score -= duty_violations
        
        # Check duplicates
        duplicates = self.count_duplicate_assignments(roster_df)
        score -= duplicates * 200
        return score
    
    def count_duplicate_assignments(self, roster_df):
        """Count duplicate assignments"""
        if roster_df is None or roster_df.empty:
            return 0
        return roster_df.duplicated(subset=['flight_id', 'crew_id']).sum()
    
    def create_initial_population(self, size=50):
        """Create initial population for genetic algorithm"""
        self.population = []
        for _ in range(size):
            roster = self.generate_random_roster()
            if roster is not None and not roster.empty:
                self.population.append(roster)
    
    def run_optimization(self, generations=100):
        """Run genetic algorithm optimization"""
        best_score = -float('inf')
        best_roster = None
        
        for generation in range(generations):
            scored_rosters = []
            for roster in self.population:
                score = self.calculate_fitness(roster)
                scored_rosters.append((score, roster))
            
            scored_rosters.sort(key=lambda x: x[0], reverse=True)
            current_best_score, current_best_roster = scored_rosters[0]

            if current_best_score > best_score:
                best_score = current_best_score
                best_roster = current_best_roster.copy()
            
            top_rosters = [roster for _, roster in scored_rosters[:len(self.population)//4]]
            new_generation = top_rosters.copy()
            
            while len(new_generation) < len(self.population):
                parent = random.choice(top_rosters)
                child = self.mutate_roster(parent.copy())
                new_generation.append(child)
            
            self.population = new_generation

        return best_roster, best_score
    
    def mutate_roster(self, roster_df):
        """Mutate roster for genetic algorithm"""
        if roster_df.empty:
            return roster_df
            
        if random.random() < 0.3:
            num_changes = random.randint(1, min(3, len(roster_df)))
            for _ in range(num_changes):
                idx_to_change = random.randint(0, len(roster_df) - 1)
                assignment = roster_df.iloc[idx_to_change]
                flight_id = assignment['flight_id']
                
                flight = self.data.flights[self.data.flights['flight_id'] == flight_id].iloc[0]
                role = assignment['role']
                
                if role in ['Captain', 'First Officer']:
                    alternatives = self.data.get_crew_by_role(
                        role=[role], base=flight['origin'], status='ACTIVE'
                    )
                else:
                    alternatives = self.data.get_crew_by_role(
                        role=['Senior Crew', 'Crew Member', 'Trainee'], 
                        base=flight['origin'], status='ACTIVE'
                    )
                
                if not alternatives.empty:
                    new_crew = alternatives.sample(1).iloc[0]
                    roster_df.at[idx_to_change, 'crew_id'] = new_crew['crew_id']
        
        return roster_df


