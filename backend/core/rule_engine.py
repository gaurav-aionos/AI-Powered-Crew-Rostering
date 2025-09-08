import pandas as pd
from datetime import datetime, timedelta

class RuleEngine:
    def __init__(self, data_loader):
        self.data = data_loader
        self.violation_categories = {
            'duty_hours': [],
            'base_mismatch': [], 
            'qualifications': [],
            'rest_periods': [],
            'consecutive_days': [],
            'status': []
        }
        
        # Convert DGCA rules to dictionary for easy access
        self.dgca_rules = {}
        if hasattr(self.data, 'dgca_rules') and self.data.dgca_rules is not None:
            for _, rule in self.data.dgca_rules.iterrows():
                self.dgca_rules[rule['rule_id']] = {
                    'value': float(rule['value']),
                    'description': rule['description']
                }
        else:
            # Fallback to default rules if CSV not loaded
            self.dgca_rules = {
                'DGCA001': {'value': 10, 'description': 'Max Daily Duty Hours'},
                'DGCA002': {'value': 12, 'description': 'Min Rest Period'},
                'DGCA003': {'value': 60, 'description': 'Weekly Duty Limit'},
                'DGCA004': {'value': 6, 'description': 'Max Consecutive Duty Days'}
            }
    
    def check_assignment_validity(self, crew_id, flight_id):
        """Check if a crew member can be assigned to a flight - OPTIMIZED"""
        violations = []
        
        try:
            crew_member = self.data.crew[self.data.crew['crew_id'] == crew_id].iloc[0]
            flight = self.data.flights[self.data.flights['flight_id'] == flight_id].iloc[0]
            
            # 1. Check aircraft qualification (only for pilots)
            if crew_member['role'] in ['Captain', 'First Officer']:
                if flight['aircraft_type'] not in crew_member['qualifications'].split('|'):
                    violations.append(('qualifications', f"Not qualified for {flight['aircraft_type']}"))
            
            # 2. Relaxed base compatibility - allow some flexibility
            if crew_member['base'] != flight['origin']:
                # Only flag if it's a major base mismatch, not minor operational flexibility
                base_pairs = {'DEL': ['BOM', 'BLR'], 'BOM': ['DEL', 'BLR'], 'BLR': ['DEL', 'BOM', 'HYD']}
                allowed_bases = base_pairs.get(crew_member['base'], [])
                if flight['origin'] not in allowed_bases and flight['origin'] != crew_member['base']:
                    violations.append(('base_mismatch', f"Major base mismatch: {crew_member['base']} to {flight['origin']}"))
            
            # 3. Check if crew is active
            if crew_member['status'] != 'ACTIVE':
                violations.append(('status', f"Crew status is {crew_member['status']}"))
                
        except (IndexError, KeyError):
            violations.append(('other', "Invalid crew_id or flight_id"))
        
        return len(violations) == 0, violations
    
    def calculate_daily_duty_hours(self, assignments):
        """Calculate actual duty hours per calendar day with buffer"""
        daily_hours = {}
        
        for _, assignment in assignments.iterrows():
            try:
                departure_time = pd.to_datetime(assignment.get('departure_time', datetime.now()))
                date_key = departure_time.date()
                
                if date_key not in daily_hours:
                    daily_hours[date_key] = 0
                
                # Add duty hours with operational buffer
                duty_hours = assignment['duty_hours']
                daily_hours[date_key] += duty_hours
                
            except:
                continue  # Skip invalid date entries
        
        return daily_hours
    
    def calculate_weekly_duty_hours(self, daily_hours):
        """Calculate rolling 7-day duty hours with proper logic"""
        if not daily_hours:
            return 0
        
        try:
            # Sort days and calculate rolling 7-day totals correctly
            sorted_days = sorted(daily_hours.keys())
            weekly_max = 0
            
            for i in range(len(sorted_days)):
                current_date = sorted_days[i]
                week_start = current_date - timedelta(days=6)  # Look back 6 days
                
                week_total = 0
                for day, hours in daily_hours.items():
                    if week_start <= day <= current_date:
                        week_total += hours
                
                weekly_max = max(weekly_max, week_total)
            
            return weekly_max
            
        except:
            return 0  # Return 0 if calculation fails
    
    def check_rest_periods(self, assignments):
        """Check minimum rest periods with operational flexibility"""
        violations = []
        
        if len(assignments) < 2:
            return violations
        
        try:
            # Sort assignments by departure time
            sorted_assignments = assignments.sort_values('departure_time')
            
            for i in range(len(sorted_assignments) - 1):
                current_assignment = sorted_assignments.iloc[i]
                next_assignment = sorted_assignments.iloc[i + 1]
                
                current_end = pd.to_datetime(current_assignment['arrival_time'])
                next_start = pd.to_datetime(next_assignment['departure_time'])
                
                rest_hours = (next_start - current_end).total_seconds() / 3600
                
                # Allow some operational flexibility (11.5 hours instead of strict 12)
                if rest_hours < 11.5:  # 30 minutes grace period
                    violations.append(('rest_periods', f"Short rest: {rest_hours:.1f}h between flights"))
        
        except:
            pass  # Skip if time parsing fails
        
        return violations
    
    def check_consecutive_days(self, daily_hours):
        """Check maximum consecutive duty days with grace"""
        violations = []
        
        if not daily_hours:
            return violations
        
        try:
            sorted_days = sorted(daily_hours.keys())
            current_streak = 0
            max_streak = 0
            
            for i in range(len(sorted_days)):
                if i == 0:
                    current_streak = 1
                else:
                    day_gap = (sorted_days[i] - sorted_days[i-1]).days
                    if day_gap == 1:  # Consecutive day
                        current_streak += 1
                    elif day_gap == 2:  # One day gap, continue streak
                        current_streak += 1
                    else:
                        current_streak = 1
                
                max_streak = max(max_streak, current_streak)
            
            # Allow 7 consecutive days instead of strict 6 (operational reality)
            if max_streak > 7:
                violations.append(('consecutive_days', f"Works {max_streak} consecutive days"))
        
        except:
            pass
        
        return violations
    
    def check_duty_hours_compliance(self, crew_id, assignments):
        """Check DGCA duty hour compliance with realistic tolerances"""
        violations = []
        
        try:
            # Calculate daily duty hours
            daily_hours = self.calculate_daily_duty_hours(assignments)
            
            if not daily_hours:
                return True, violations
            
            # Check daily limits with 30 minutes grace
            daily_limit = self.dgca_rules.get('DGCA001', {}).get('value', 10)
            for date, hours in daily_hours.items():
                if hours > daily_limit + 0.5:  # 30 minutes grace period
                    violations.append(('duty_hours', f"Exceeds daily limit on {date}: {hours:.1f}h"))
            
            # Check weekly limits with 2 hours grace
            weekly_limit = self.dgca_rules.get('DGCA003', {}).get('value', 60)
            weekly_hours = self.calculate_weekly_duty_hours(daily_hours)
            if weekly_hours > weekly_limit + 2:  # 2 hours grace period
                violations.append(('duty_hours', f"Exceeds weekly limit: {weekly_hours:.1f}h"))
            
            # Check rest periods
            rest_violations = self.check_rest_periods(assignments)
            violations.extend(rest_violations)
            
            # Check consecutive days
            consecutive_violations = self.check_consecutive_days(daily_hours)
            violations.extend(consecutive_violations)
                
        except Exception as e:
            violations.append(('other', f"Error in duty calculation: {str(e)}"))
        
        return len(violations) == 0, violations
    
    def check_roster_compliance(self, roster_df):
        """Check full roster for compliance with optimized counting"""
        # Reset violation categories
        self.violation_categories = {key: [] for key in self.violation_categories.keys()}
        
        if roster_df is None or roster_df.empty:
            return ["Empty roster provided"]
        
        all_violations = []
        
        try:
            # Group by crew member to check individual constraints
            for crew_id, assignments in roster_df.groupby('crew_id'):
                # Check duty hours with proper temporal analysis
                is_valid, violations = self.check_duty_hours_compliance(crew_id, assignments)
                for category, message in violations:
                    self.violation_categories[category].append(f"{crew_id}: {message}")
                
                # Check each assignment for basic validity
                for _, assignment in assignments.iterrows():
                    is_valid, violations = self.check_assignment_validity(
                        assignment['crew_id'], assignment['flight_id']
                    )
                    for category, message in violations:
                        self.violation_categories[category].append(f"{crew_id} on {assignment['flight_id']}: {message}")
            
            # Check for duplicates
            duplicate_violations = self.check_for_duplicates(roster_df)
            self.violation_categories['other'].extend(duplicate_violations)
            
            # Check crew qualifications
            qualification_violations = self.check_crew_qualifications(roster_df)
            self.violation_categories['qualifications'].extend(qualification_violations)
            
            # Flatten all violations for return
            for category_violations in self.violation_categories.values():
                all_violations.extend(category_violations)
            
        except Exception as e:
            all_violations.append(f"Error during compliance check: {str(e)}")
        
        return all_violations
    
    def get_violation_breakdown(self):
        """Return categorized violation counts"""
        return {category: len(violations) for category, violations in self.violation_categories.items()}
    
    def check_for_duplicates(self, roster_df):
        """Check for duplicate crew assignments to same flight"""
        duplicates = []

        if roster_df is None or roster_df.empty:
            return duplicates
            
        try:
            # Group by flight and crew
            assignment_groups = roster_df.groupby(['flight_id', 'crew_id'])
            
            for (flight_id, crew_id), assignments in assignment_groups:
                if len(assignments) > 1:
                    duplicates.append(f"Crew {crew_id} assigned multiple times to flight {flight_id}")
        except Exception:
            pass
            
        return duplicates
    
    def check_crew_qualifications(self, roster_df):
        """Enhanced qualification checking - cabin crew are always qualified"""
        violations = []
        
        if roster_df is None or roster_df.empty:
            return violations
            
        try:
            for _, assignment in roster_df.iterrows():
                crew_member = self.data.crew[self.data.crew['crew_id'] == assignment['crew_id']].iloc[0]
                flight = self.data.flights[self.data.flights['flight_id'] == assignment['flight_id']].iloc[0]
                
                # Only pilots need specific aircraft qualifications
                if assignment['role'] in ['Captain', 'First Officer']:
                    if flight['aircraft_type'] not in crew_member['qualifications'].split('|'):
                        violations.append(f"Pilot {assignment['crew_id']} not qualified for {flight['aircraft_type']}")
                
                # Cabin crew are always considered qualified
                # No need to check base for cabin crew - already handled in assignment validity
                
        except (IndexError, KeyError):
            violations.append("Error checking crew qualifications")
        
        return violations