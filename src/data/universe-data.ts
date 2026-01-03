export interface Location {
  id: string;
  name: string;
  description: string;
  cx: number;
  cy: number;
  type: 'planet' | 'station' | 'anomaly';
  thumbUrl: string;
}

export interface Region {
  id: string;
  name: string;
  description: string;
  path?: string;
  color: string;
  cx: number;
  cy: number;
  thumbUrl: string;
  backgroundUrl: string;
  imageUrl: string;
  locations: Location[];
}

export interface UniverseConfig {
  multiverseBackgroundUrl: string;
}

export const CONFIG: UniverseConfig = {
  multiverseBackgroundUrl: "/videos/Lore%20Background.mp4"
};

export const UNIVERSE_DATA: Region[] = [
  {
    "id": "nebula-prime",
    "name": "ALPHA ONE",
    "description": "The central hub of the galaxy, teeming with trade and ancient technology.",
    "color": "#4f46e5",
    "cx": 500,
    "cy": 300,
    "thumbUrl": "/images/nebula-prime-thumb.png",
    "backgroundUrl": "/images/nebula-prime.png",
    "imageUrl": "/images/nebula-prime.png",
    "locations": [
      {
        "id": "prime-core",
        "name": "The Core",
        "description": "Central command of the hub.",
        "cx": 400,
        "cy": 350,
        "type": "station",
        "thumbUrl": "/images/nebula-prime-thumb.png"
      },
      {
        "id": "trading-outpost",
        "name": "Outpost 7",
        "description": "Busy trading post.",
        "cx": 600,
        "cy": 250,
        "type": "station",
        "thumbUrl": "/images/nebula-prime-thumb.png"
      },
      {
        "id": "ancient-shard",
        "name": "Ancient Shard",
        "description": "Mysterious artifact floating in space.",
        "cx": 500,
        "cy": 500,
        "type": "anomaly",
        "thumbUrl": "/images/nebula-prime-thumb.png"
      }
    ]
  },
  {
    "id": "cryo-wastes",
    "name": "Cryo Wastes",
    "description": "A frozen sector where entropy has slowed time itself.",
    "color": "#06b6d4",
    "cx": 200,
    "cy": 200,
    "thumbUrl": "/images/cryo-wastes.png",
    "backgroundUrl": "/images/cryo-wastes.png",
    "imageUrl": "/images/cryo-wastes.png",
    "locations": [
      {
        "id": "ice-citadel",
        "name": "Ice Base",
        "description": "A fortress built into a moon.",
        "cx": 150,
        "cy": 150,
        "type": "planet",
        "thumbUrl": "/images/cryo-wastes.png"
      },
      {
        "id": "frozen-wreck",
        "name": "Frozen Wreck",
        "description": "A ship lost to the ice.",
        "cx": 250,
        "cy": 250,
        "type": "anomaly",
        "thumbUrl": "/images/cryo-wastes.png"
      }
    ]
  },
  {
    "id": "magma-forge",
    "name": "Magma Forge",
    "description": "Industrial core mining heavy elements from dying stars.",
    "color": "#ef4444",
    "cx": 800,
    "cy": 600,
    "thumbUrl": "/images/magma-forge.png",
    "backgroundUrl": "/images/magma-forge.png",
    "imageUrl": "/images/magma-forge.png",
    "locations": [
      {
        "id": "smelter-complex",
        "name": "Smelter Complex",
        "description": "Primary refining station.",
        "cx": 750,
        "cy": 550,
        "type": "station",
        "thumbUrl": "/images/magma-forge.png"
      },
      {
        "id": "lava-extraction",
        "name": "Extraction Site B",
        "description": "Mining operation in the magma rivers.",
        "cx": 850,
        "cy": 650,
        "type": "planet",
        "thumbUrl": "/images/magma-forge.png"
      }
    ]
  },
  {
    "id": "void-expanse",
    "name": "Void Expanse",
    "description": "Mysterious dark matter cloud. Enter at your own risk.",
    "color": "#8b5cf6",
    "cx": 850,
    "cy": 150,
    "thumbUrl": "/images/void-expanse.png",
    "backgroundUrl": "/images/void-expanse.png",
    "imageUrl": "/images/void-expanse.png",
    "locations": [
      {
        "id": "dark-anchor",
        "name": "Dark Anchor",
        "description": "Stable point in the void.",
        "cx": 800,
        "cy": 100,
        "type": "anomaly",
        "thumbUrl": "/images/void-expanse.png"
      },
      {
        "id": "void-eye",
        "name": "The Eye",
        "description": "Silent observation post.",
        "cx": 900,
        "cy": 200,
        "type": "station",
        "thumbUrl": "/images/void-expanse.png"
      }
    ]
  },
  {
    "id": "univ-1767135380112",
    "name": "ALPHA ONE",
    "description": "A newly discovered realm.",
    "color": "#ffffff",
    "cx": 500,
    "cy": 400,
    "thumbUrl": "/images/multiversal-bg.png",
    "backgroundUrl": "/images/multiversal-bg.png",
    "imageUrl": "/images/multiversal-bg.png",
    "locations": []
  },
  {
    "id": "univ-1767136475924",
    "name": "Test Universe",
    "description": "A newly discovered realm.",
    "color": "#ffffff",
    "cx": 500,
    "cy": 400,
    "thumbUrl": "/images/multiversal-bg.png",
    "backgroundUrl": "/images/multiversal-bg.png",
    "imageUrl": "/images/multiversal-bg.png",
    "locations": []
  }
];
