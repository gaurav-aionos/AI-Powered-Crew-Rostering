

import numpy as np
import pandas   as pd
def generate_crew(num_crew=200):  # Increased from 100 to 200
    """Generate more crew members for better coverage"""
    print("Generating crew data...")
    
    bases = ['DEL', 'BOM', 'BLR', 'HYD', 'CCU', 'MAA']
    aircraft_qualifications = ['A320', 'A321', 'A320neo', 'A321neo', 'ATR72']
    
    crew = []
    crew_id = 1
    
    # Generate more Pilots (50% increase)
    for _ in range(60):  # Increased from 40 to 60
        crew_id_str = f'PIL{crew_id:04d}'
        base = np.random.choice(bases)
        
        # Qualifications: 1-2 aircraft types
        num_qualifications = np.random.randint(1, 3)
        qualifications = np.random.choice(aircraft_qualifications, num_qualifications, replace=False)
        
        crew.append({
            'crew_id': crew_id_str,
            'base': base,
            'role': np.random.choice(['Captain', 'First Officer']),
            'qualifications': '|'.join(qualifications),
            'rank': f'P{np.random.randint(1, 5)}',
            'status': 'ACTIVE',
            'max_duty_hours': np.random.randint(8, 11),
            'preferred_base': base
        })
        crew_id += 1
    
    # Generate more Cabin Crew (50% increase)
    for _ in range(140):  # Increased from 60 to 140
        crew_id_str = f'CAB{crew_id:04d}'
        base = np.random.choice(bases)
        
        crew.append({
            'crew_id': crew_id_str,
            'base': base,
            'role': np.random.choice(['Senior Crew', 'Crew Member', 'Trainee']),
            'qualifications': 'ALL',
            'rank': f'C{np.random.randint(1, 4)}',
            'status': 'ACTIVE',
            'max_duty_hours': np.random.randint(9, 12),
            'preferred_base': base
        })
        crew_id += 1
    
    crew_df = pd.DataFrame(crew)
    crew_df.to_csv('data/input/crew.csv', index=False)
    print(f"Generated {len(crew_df)} crew members")
    return crew_df

generate_crew(200)