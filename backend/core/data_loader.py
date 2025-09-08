import pandas as pd
import numpy as np
from datetime import datetime

class DataLoader:
    def __init__(self):
        self.flights = None
        self.crew = None
        self.preferences = None
        self.dgca_rules = None
        self.historical_rosters = None
    
    def load_all_data(self, flights_path, crew_path, preferences_path, rules_path, historical_path):
        """Load all CSV files and preprocess data with proper datetime handling"""
        print("Loading and validating data...")
        
        try:
            # Load flights with proper datetime parsing
            self.flights = pd.read_csv(flights_path)
            self.flights['departure_time'] = pd.to_datetime(self.flights['departure_time'], errors='coerce')
            self.flights['arrival_time'] = pd.to_datetime(self.flights['arrival_time'], errors='coerce')
            
            # Check for invalid datetime values
            if self.flights['departure_time'].isnull().any() or self.flights['arrival_time'].isnull().any():
                print("Warning: Some flight times could not be parsed correctly")
            
            # Load other data
            self.crew = pd.read_csv(crew_path)
            
            # Load preferences (optional)
            try:
                self.preferences = pd.read_csv(preferences_path)
            except FileNotFoundError:
                print("Preferences file not found, creating empty dataframe")
                self.preferences = pd.DataFrame(columns=['crew_id', 'preference_type', 'preference_value', 'priority'])
            
            # Load DGCA rules (optional)
            try:
                self.dgca_rules = pd.read_csv(rules_path)
            except FileNotFoundError:
                print("DGCA rules file not found, using default rules")
                self.dgca_rules = pd.DataFrame(columns=['rule_id', 'rule_name', 'value', 'description'])
            
            # Load historical rosters (optional)
            try:
                self.historical_rosters = pd.read_csv(historical_path)
            except FileNotFoundError:
                print("Historical rosters file not found, creating empty dataframe")
                self.historical_rosters = pd.DataFrame(columns=['date', 'flight_id', 'crew_id', 'role', 'duty_hours', 'status'])
            
            print(f"Loaded {len(self.flights)} flights, {len(self.crew)} crew members")
            return True
            
        except Exception as e:
            print(f"Error loading data: {e}")
            return False
    def get_crew_by_role(self, role=None, base=None, status='ACTIVE'):
        """Filter crew by role, base, and status"""
        filtered_crew = self.crew[self.crew['status'] == status]
        
        if role:
            if isinstance(role, list):
                filtered_crew = filtered_crew[filtered_crew['role'].isin(role)]
            else:
                filtered_crew = filtered_crew[filtered_crew['role'] == role]
        
        if base:
            filtered_crew = filtered_crew[filtered_crew['base'] == base]
        
        return filtered_crew
    
    def get_flights_by_date_range(self, start_date, end_date):
        """Get flights within a date range"""
        mask = (self.flights['departure_time'] >= start_date) & \
               (self.flights['departure_time'] <= end_date)
        return self.flights[mask]
    def load_all_data(self, flights_path, crew_path, preferences_path, 
                     rules_path, historical_path):
        """Load all CSV files and preprocess data with error handling"""
        print("Loading and validating data...")
        
        try:
            # Load flights
            self.flights = pd.read_csv(flights_path)
            self.flights['departure_time'] = pd.to_datetime(self.flights['departure_time'])
            self.flights['arrival_time'] = pd.to_datetime(self.flights['arrival_time'])
            
            # Load crew
            self.crew = pd.read_csv(crew_path)
            
            # Load preferences (optional)
            try:
                self.preferences = pd.read_csv(preferences_path)
            except FileNotFoundError:
                print("Preferences file not found, creating empty dataframe")
                self.preferences = pd.DataFrame(columns=['crew_id', 'preference_type', 'preference_value', 'priority'])
            
            # Load DGCA rules (optional)
            try:
                self.dgca_rules = pd.read_csv(rules_path)
            except FileNotFoundError:
                print("DGCA rules file not found, using default rules")
                self.dgca_rules = pd.DataFrame(columns=['rule_id', 'rule_name', 'value', 'description'])
            
            # Load historical rosters (optional)
            try:
                self.historical_rosters = pd.read_csv(historical_path)
            except FileNotFoundError:
                print("Historical rosters file not found, creating empty dataframe")
                self.historical_rosters = pd.DataFrame(columns=['date', 'flight_id', 'crew_id', 'role', 'duty_hours', 'status'])
            
            print(f"Loaded {len(self.flights)} flights, {len(self.crew)} crew members")
            return True
            
        except Exception as e:
            print(f"Error loading data: {e}")
            return False