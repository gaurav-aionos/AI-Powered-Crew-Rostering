# Data Paths
INPUT_FLIGHTS_PATH = "data/input/flights.csv"
INPUT_CREW_PATH = "data/input/crew.csv"
INPUT_PREFERENCES_PATH = "data/input/preferences.csv"
INPUT_DGCA_RULES_PATH = "data/input/dgca_rules.csv"
INPUT_HISTORICAL_PATH = "data/input/historical_rosters.csv"

OUTPUT_BASE_ROSTER_PATH = "data/output/base_roster.csv"
OUTPUT_RECOVERED_ROSTER_PATH = "data/output/recovered_roster.csv"

# Genetic Algorithm Parameters
POPULATION_SIZE = 30
GENERATIONS = 50
MUTATION_RATE = 0.2

# DGCA Rules (fallback if not in CSV)
MAX_DAILY_DUTY_HOURS = 10
MIN_REST_HOURS = 12
MAX_WEEKLY_DUTY_HOURS = 60



# Genetic Algorithm Parameters - UPDATED FOR STRICTER OPTIMIZATION
POPULATION_SIZE = 80    # Increased for more diversity
GENERATIONS = 150       # Increased for better convergence
MUTATION_RATE = 0.25    # Balanced mutation rate


# DGCA Rules (fallback if not in CSV)
MAX_DAILY_DUTY_HOURS = 10
MIN_REST_HOURS = 12
MAX_WEEKLY_DUTY_HOURS = 60
MAX_CONSECUTIVE_DAYS = 6

# Fallback rules if CSV loading fails
DEFAULT_DGCA_RULES = {
    'DGCA001': {'value': 10, 'description': 'Max Daily Duty Hours'},
    'DGCA002': {'value': 12, 'description': 'Min Rest Period'}, 
    'DGCA003': {'value': 60, 'description': 'Weekly Duty Limit'},
    'DGCA004': {'value': 6, 'description': 'Max Consecutive Duty Days'}
}