import { DescriptorOption } from '../types';

export interface DescriptorGroup {
  id: string;
  title: string;
  description: string;
  options: DescriptorOption[];
}

export const DESCRIPTOR_GROUPS: DescriptorGroup[] = [
  {
    id: 'water_presence',
    title: 'Water & Maritime Presence',
    description: 'Proximity and relationship to bodies of water',
    options: [
      { id: 'water', label: 'Water Present', category: 'water_presence' },
      { id: 'ocean', label: 'Ocean / Sea', category: 'water_presence' },
      { id: 'river', label: 'River / Canal / Waterfall', category: 'water_presence' },
      { id: 'coastal', label: 'Coastal / Shoreline', category: 'water_presence' },
      { id: 'island', label: 'Island / Surrounded', category: 'water_presence' },
      { id: 'landlocked', label: 'Purely Landlocked / Dry', category: 'water_presence' },
    ],
  },
  {
    id: 'terrain',
    title: 'Terrain & Environment',
    description: 'Topography and natural ecosystem',
    options: [
      { id: 'desert', label: 'Desert / Arid Dunes', category: 'terrain' },
      { id: 'mountain', label: 'Mountains / High Elevation', category: 'terrain' },
      { id: 'canyon', label: 'Canyon / Ravine / Gorge', category: 'terrain' },
      { id: 'valley', label: 'Valley / Plain', category: 'terrain' },
      { id: 'forest', label: 'Lush Forest / Tropical', category: 'terrain' },
      { id: 'urban', label: 'Urban / Dense Cityscape', category: 'terrain' },
      { id: 'cliff', label: 'Vertical Cliffs / Precipice', category: 'terrain' },
    ],
  },
  {
    id: 'structure',
    title: 'Structure Type & Archetype',
    description: 'Primary architectural or geological archetype',
    options: [
      { id: 'tower', label: 'Tower / Spire / Minaret', category: 'structure' },
      { id: 'bridge', label: 'Bridge / Spanning Arch', category: 'structure' },
      { id: 'pyramid', label: 'Pyramidal / Ziggurat', category: 'structure' },
      { id: 'temple', label: 'Temple / Cathedral / Sacred', category: 'structure' },
      { id: 'dome', label: 'Dome / Rotunda / Cupola', category: 'structure' },
      { id: 'amphitheater', label: 'Amphitheater / Arena / Oval', category: 'structure' },
      { id: 'statue', label: 'Colossal Statue / Figure', category: 'structure' },
      { id: 'fortress', label: 'Fortress / Wall / Bastion', category: 'structure' },
      { id: 'natural_formation', label: 'Pure Natural Formation', category: 'structure' },
      { id: 'modern_skyscraper', label: 'Modern Skyscraper / High-Tech', category: 'structure' },
    ],
  },
  {
    id: 'geometry',
    title: 'Geometry & Dominant Lines',
    description: 'Geometric orientation and contours',
    options: [
      { id: 'triangular', label: 'Triangular / Pointed', category: 'geometry' },
      { id: 'arched', label: 'Arched / Vaulted', category: 'geometry' },
      { id: 'curved', label: 'Curved / Circular / Spherical', category: 'geometry' },
      { id: 'linear', label: 'Linear / Long Horizontal', category: 'geometry' },
      { id: 'tall', label: 'Extreme Vertical Ascent', category: 'geometry' },
      { id: 'tiered', label: 'Tiered / Stepped Terraces', category: 'geometry' },
      { id: 'asymmetric', label: 'Asymmetric / Irregular', category: 'geometry' },
    ],
  },
  {
    id: 'materials',
    title: 'Substances & Materials',
    description: 'Dominant physical makeup perceived',
    options: [
      { id: 'stone', label: 'Hewn Stone / Masonry', category: 'materials' },
      { id: 'iron', label: 'Iron / Steel / Metal', category: 'materials' },
      { id: 'marble', label: 'Polished Marble / White Stone', category: 'materials' },
      { id: 'sandstone', label: 'Sandstone / Red Earth / Rock', category: 'materials' },
      { id: 'glass', label: 'Glass / Reflective Paneling', category: 'materials' },
      { id: 'ice', label: 'Snow / Ice / Frozen', category: 'materials' },
      { id: 'earth', label: 'Raw Soil / Terracotta / Clay', category: 'materials' },
    ],
  },
  {
    id: 'colors',
    title: 'Color Impressions',
    description: 'Prominent chromatic signatures',
    options: [
      { id: 'golden', label: 'Golden / Amber / Sand', category: 'colors' },
      { id: 'red', label: 'Red / Terracotta / Russet', category: 'colors' },
      { id: 'azure', label: 'Deep Blue / Azure / Teal', category: 'colors' },
      { id: 'white', label: 'Pure White / Pale Alabaster', category: 'colors' },
      { id: 'grey', label: 'Granite Grey / Metallic', category: 'colors' },
      { id: 'green', label: 'Emerald / Forest Green', category: 'colors' },
      { id: 'dark', label: 'Dark / Charcoal / Shadowy', category: 'colors' },
    ],
  },
  {
    id: 'atmosphere',
    title: 'Scale & Atmosphere',
    description: 'Felt emotional tone and physical scale',
    options: [
      { id: 'massive', label: 'Massive / Monumental / Colossal', category: 'atmosphere' },
      { id: 'serene', label: 'Serene / Still / Meditative', category: 'atmosphere' },
      { id: 'ancient', label: 'Ancient / Millennia-Old Aura', category: 'atmosphere' },
      { id: 'windy', label: 'Windy / Exposed / High-Altitude', category: 'atmosphere' },
      { id: 'bustling', label: 'Bustling / Human Convergence', category: 'atmosphere' },
      { id: 'sacred', label: 'Sacred / Reverent Weight', category: 'atmosphere' },
      { id: 'isolated', label: 'Remote / Isolated / Silent', category: 'atmosphere' },
    ],
  },
];
