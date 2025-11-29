import { GoogleGenAI, Type } from "@google/genai";
import { DesignResponse, RoomSpecs, FloorItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDesignPlan = async (specs: RoomSpecs, floorPlanItems?: FloorItem[]): Promise<DesignResponse> => {
  let layoutDescription = "";
  
  if (floorPlanItems && floorPlanItems.length > 0) {
    layoutDescription = "User has manually engineered the layout with specific constraints:\n";
    
    // Separate indoor and outdoor items
    const indoorItems = floorPlanItems.filter(i => i.zone === 'indoor');
    const outdoorItems = floorPlanItems.filter(i => i.zone === 'outdoor');

    if (indoorItems.length > 0) {
      layoutDescription += "INDOOR ZONE (46sqm):\n";
      indoorItems.forEach(item => {
        const vPos = item.y < 50 ? "rear/window side" : "front/entrance side";
        const hPos = item.x < 50 ? "left" : "right";
        const connectivity = item.connectivity === 'enclosed' ? "fully enclosed room" : item.connectivity === 'partition' ? "semi-private with partition" : "open plan";
        layoutDescription += `- ${item.label}: Located at ${vPos} ${hPos}. Rotated ${item.rotation}°. Structure: ${connectivity}.\n`;
      });
    }

    if (outdoorItems.length > 0) {
      layoutDescription += "OUTDOOR ROOFTOP ZONE:\n";
      outdoorItems.forEach(item => {
        layoutDescription += `- ${item.label}: Located outside on the artificial grass. Rotated ${item.rotation}°.\n`;
      });
    }
  }

  const prompt = `
    Role: Expert Interior Architect & Civil Engineer.
    Task: Create a detailed technical execution plan for a rooftop studio (46 sqm built area + outdoor terrace).
    Language: Arabic (Output must be in Arabic).

    Project Specifications:
    - Total Built Area: ${specs.totalArea} square meters.
    - Required Zones: ${specs.features.join(', ')}.
    - Structural Constraints: ${specs.constraints}.
    - User Layout & Engineering Constraints: 
      ${layoutDescription || "Optimized by architect based on constraints."}

    Required Detailed Analysis (JSON):
    1. **Spatial Arrangement**: Describe the flow based on the user's manual placement. Explain how the "Enclosed" vs "Open" choices affect the space.
    2. **Furniture Plan**: Specific furniture dimensions and orientations based on user rotation input.
    3. **Lighting Plan**: Lighting for indoor zones and outdoor extensions.
    4. **Materials & Colors**: Interior finishes contrasting with the outdoor artificial grass.

    Output Format: JSON only conforming to the schema.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          conceptName: { type: Type.STRING, description: "Creative name for the design concept in Arabic" },
          designPhilosophy: { type: Type.STRING, description: "Brief explanation of the flow and vibe in Arabic" },
          spatialArrangement: { type: Type.STRING, description: "Detailed layout description answering how zones fit together in Arabic" },
          areaBreakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                zone: { type: Type.STRING },
                area: { type: Type.STRING, description: "Estimated sqm" },
                description: { type: Type.STRING, description: "Furniture placement and logic" }
              }
            }
          },
          materials: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Flooring, walls, and coordination with outdoor grass" },
          lighting: { type: Type.STRING, description: "Detailed lighting strategy (General, Task, Decorative)" },
          furnitureRecommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific furniture pieces including L-desk details" }
        }
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as DesignResponse;
  }
  throw new Error("Failed to generate design plan");
};

export const generateDesignVisualization = async (specs: RoomSpecs, designConcept?: string, floorPlanItems?: FloorItem[]): Promise<string> => {
  let layoutPrompt = "";

  if (floorPlanItems && floorPlanItems.length > 0) {
    layoutPrompt = "STRICTLY FOLLOW THIS STRUCTURAL LAYOUT:\n";
    
    // Sort items by depth (Y) to help the model layer them
    const sortedItems = [...floorPlanItems].sort((a, b) => a.y - b.y);

    sortedItems.forEach(item => {
      // Map 0-100% coordinates to visual descriptions
      const depth = item.y < 30 ? "far background" : item.y < 60 ? "mid-ground" : "foreground";
      const side = item.x < 33 ? "left" : item.x < 66 ? "center" : "right";
      const zoneContext = item.zone === 'outdoor' ? "OUTSIDE on the grass terrace" : "INSIDE the studio";
      const enclosure = item.connectivity === 'enclosed' ? "inside a walled room" : item.connectivity === 'partition' ? "behind a partition" : "in open space";
      
      layoutPrompt += `- ${item.label} (${item.type}): Positioned ${depth} ${side} ${zoneContext}. Orientation: ${item.rotation} degrees. Context: ${enclosure}.\n`;
    });
  } else {
    layoutPrompt = `
      1. Foreground Right: Black metal spiral staircase structure.
      2. Main Space: Open plan with a cozy living area and kitchen bar.
      3. Workspace: A dedicated corner with L-shaped desk.
      4. Background: Large Aluminum sliding glass doors opening to green grass.
    `;
  }

  const imagePrompt = `
    Photorealistic architectural interior render, 8k resolution, cinematic lighting.
    Subject: A modern ${specs.totalArea} sqm rooftop studio apartment with an attached outdoor terrace.
    Viewpoint: Wide angle looking from the entrance/staircase area towards the outdoor sliding doors.
    
    Specific Layout Requirements:
    ${layoutPrompt}

    Key Details:
    - Outdoors: Vibrant green artificial grass visible through the large sliding glass doors or directly if items are placed outside.
    - Style: ${specs.style || "Modern Contemporary"}.
    - Atmosphere: Bright, organized, highly functional.
    - Colors: Neutral tones with warm wood accents.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: imagePrompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated");
};