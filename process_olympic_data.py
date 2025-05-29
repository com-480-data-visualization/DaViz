import pandas as pd
import json

def load_mappings(noc_path='./data/noc_regions.csv', coord_path='./data/lat_long.csv'):
    """Load both NOC mappings and country coordinates"""
    # Load NOC to country name mapping
    noc_df = pd.read_csv(noc_path)
    noc_to_country = dict(zip(noc_df['NOC'], noc_df['region']))
    
    # Load country coordinates (using country names)
    coord_df = pd.read_csv(coord_path)
    country_to_coords = dict(zip(coord_df['country'], 
                             zip(coord_df['latitude'], coord_df['longitude'])))
    
    return noc_to_country, country_to_coords

# Load mappings at script start
noc_to_country, country_to_coords = load_mappings()

def get_country_coordinates(noc_code):
    """Get coordinates for a NOC code by first mapping to country name"""
    country_name = noc_to_country.get(noc_code)
    if not country_name:
        return (None, None)
    
    # Handle special cases where country name might differ
    special_cases = {
        'UK': 'United Kingdom',
        'USA': 'United States',
        'CIV': 'Ivory Coast',
        'URS': 'Russia',  # USSR is now Russia
        # Add any other special mappings needed
    }
    
    country_name = special_cases.get(country_name, country_name)
    return country_to_coords.get(country_name, (None, None))

# Load the dataset
df = pd.read_csv('data/athlete_events.csv')

# Drop rows with missing data for physical attributes
df_cleaned = df.dropna(subset=['Age', 'Height', 'Weight'])

# Gender distribution
gender_counts = df['Sex'].value_counts().to_dict()

# Top 5 sports by participation
top_sports = df['Sport'].value_counts().nlargest(5).to_dict()

# Medal distribution (drop NA)
medal_counts = df[df['Medal'].notna()]['Medal'].value_counts().to_dict()

# Top 5 countries by total medals
top_countries = (
    df[df['Medal'].notna()]
    .groupby('NOC')['Medal']
    .count()
    .nlargest(5)
    .to_dict()
)

# Age distribution bins
age_bins = pd.cut(df_cleaned['Age'], bins=[0, 19, 25, 30, 35, 100], 
                  labels=['Under 20', '20-25', '26-30', '31-35', 'Over 35']).value_counts().sort_index().to_dict()

# Height distribution bins
height_bins = pd.cut(df_cleaned['Height'], bins=[0, 160, 170, 180, 190, 300], 
                     labels=['Under 160cm', '160-170cm', '170-180cm', '180-190cm', 'Over 190cm']).value_counts().sort_index().to_dict()

# Weight distribution bins
weight_bins = pd.cut(df_cleaned['Weight'], bins=[0, 60, 70, 80, 90, 200], 
                     labels=['Under 60kg', '60-70kg', '70-80kg', '80-90kg', 'Over 90kg']).value_counts().sort_index().to_dict()

# Calculate medals per participant (efficiency)
participants_per_country = df.groupby('NOC')['ID'].nunique()
medals_per_country = df[df['Medal'].notna()].groupby('NOC')['Medal'].count()

efficiency = (medals_per_country / participants_per_country).dropna()
top_efficiency = efficiency.nlargest(5).to_dict()

# Get medal counts by country
medal_counts_by_country = df[df['Medal'].notna()].groupby('NOC')['Medal'].count().nlargest(50).to_dict()

# Get medal counts by country for all countries
medal_counts_by_country_all = df[df['Medal'].notna()].groupby('NOC')['Medal'].count().to_dict()

# Create heatmap data using the CSV coordinates
heatmap_data = {}
for noc_code, count in medal_counts_by_country.items():
    lat, lng = get_country_coordinates(noc_code)
    if lat and lng:
        heatmap_data[noc_code] = {
            "lat": lat,
            "lng": lng,
            "count": count
        }

countries_medals = {}
for noc_code, count in medal_counts_by_country_all.items():
    countries_medals[noc_code] = {
        "count": count
    }

# Structure for JS
output = {
    "gender": {
        "labels": list(gender_counts.keys()),
        "data": list(gender_counts.values())
    },
    "sports": {
        "labels": list(top_sports.keys()),
        "data": list(top_sports.values())
    },
    "medals": {
        "labels": list(medal_counts.keys()),
        "data": list(medal_counts.values())
    },
    "countries": {
        "labels": list(top_countries.keys()),
        "data": list(top_countries.values())
    },
    "medal_efficiency": {
        "labels": list(top_efficiency.keys()),
        "data": list(top_efficiency.values())
    },
    "age": {
        "labels": list(age_bins.keys()),
        "data": list(age_bins.values())
    },
    "height": {
        "labels": list(height_bins.keys()),
        "data": list(height_bins.values())
    },
    "weight": {
        "labels": list(weight_bins.keys()),
        "data": list(weight_bins.values())
    }
}

output["heatmap"] = heatmap_data

# Add all medal counts to output
output["medal_counts_all"] = countries_medals
# Save to JSON
with open('docs/olympic_data.json', 'w') as f:
    json.dump(output, f, indent=2)

print("✅ Data processed and saved to docs/olympic_data.json")