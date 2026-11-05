import { GoogleGenAI } from '@google/genai';
import { ENV } from '../config/env';
import { IClothingItem } from '../models/clothingItem.model';
import { WeatherData } from './weather.service';

export interface RecognizedAttributes {
  name: string;
  category: 'TOPS' | 'BOTTOMS' | 'DRESSES' | 'OUTERWEAR' | 'FOOTWEAR' | 'ACCESSORIES' | 'TRADITIONAL';
  subcategory: string;
  primaryColor: string;
  secondaryColors: string[];
  pattern: string;
  fabric: string;
  seasonality: 'SUMMER' | 'WINTER' | 'MONSOON' | 'ALL_SEASON';
  brand?: string;
  formalness: string;
}

export interface GroundedOutfitProposal {
  title: string;
  occasion: string;
  rationale: string;
  season?: string;
  items: {
    clothingItemId: string;
    role: 'TOP' | 'BOTTOM' | 'OUTERWEAR' | 'SHOES' | 'ACCESSORY';
  }[];
}

class GeminiService {
  private ai: GoogleGenAI | null = null;
  private readonly candidateModels = [
    'gemini-3-flash-preview',
    'gemini-flash-latest',
    'gemini-3.8-flash',
  ];

  constructor() {
    if (ENV.GEMINI_API_KEY && ENV.GEMINI_API_KEY !== 'dummy_key_for_dev_mode') {
      try {
        this.ai = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });
      } catch (err) {
        console.warn('[Gemini Init Warning]', err);
      }
    }
  }

  private async generateWithFallback(contents: any[]): Promise<string> {
    if (!this.ai) {
      throw new Error('Gemini AI is not initialized.');
    }
    let lastError: any = null;
    for (const model of this.candidateModels) {
      try {
        const response = await this.ai.models.generateContent({
          model,
          contents,
        });
        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Model ${model} Warning]:`, err.message || err);
      }
    }
    throw lastError || new Error('All Gemini candidate models failed.');
  }

  public async recognizeClothing(
    imageBase64OrUrl: string
  ): Promise<RecognizedAttributes> {
    if (!this.ai) {
      console.warn('[Gemini] API Key not set; using heuristic recognition.');
      return this.generateHeuristicAttributes(imageBase64OrUrl);
    }

    try {
      const prompt = `
You are DHORA's expert fashion AI. Analyze this clothing item image carefully and return a valid JSON object with the following fields:
- "name": Concise stylish title
- "category": One of exactly: "TOPS", "BOTTOMS", "DRESSES", "OUTERWEAR", "FOOTWEAR", "ACCESSORIES", "TRADITIONAL"
- "subcategory": Common item type
- "primaryColor": Dominant color
- "secondaryColors": Array of accent or pattern colors
- "pattern": e.g. "Solid", "Striped", "Checkered", "Printed", "Embroidered", "Floral"
- "fabric": Estimated fabric
- "seasonality": One of: "SUMMER", "WINTER", "MONSOON", "ALL_SEASON"
- "formalness": "CASUAL", "SMART_CASUAL", "FORMAL", or "FESTIVE"

Return strictly valid JSON only without markdown code blocks.`;

      const text = await this.generateWithFallback([
        { text: prompt },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64OrUrl.replace(/^data:image\/\w+;base64,/, ''),
          },
        },
      ]);

      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        name: parsed.name || 'Fashion Garment',
        category: this.sanitizeCategory(parsed.category),
        subcategory: parsed.subcategory || 'Clothing',
        primaryColor: parsed.primaryColor || 'Neutral',
        secondaryColors: Array.isArray(parsed.secondaryColors) ? parsed.secondaryColors : [],
        pattern: parsed.pattern || 'Solid',
        fabric: parsed.fabric || 'Cotton',
        seasonality: parsed.seasonality || 'ALL_SEASON',
        formalness: parsed.formalness || 'CASUAL',
      };
    } catch (error: any) {
      console.warn('[Gemini Recognition Error]:', error.message);
      return this.generateHeuristicAttributes(imageBase64OrUrl);
    }
  }

  public async generateOutfitsGrounded(
    availableItems: IClothingItem[],
    occasion: string = 'University / Daily Casual',
    weather?: WeatherData,
    stylePrefs?: any
  ): Promise<GroundedOutfitProposal[]> {
    if (availableItems.length < 2) {
      return [];
    }

    // Prepare clean minimal inventory representation for grounding
    const inventory = availableItems.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      category: item.category,
      subcategory: item.subcategory,
      color: item.primaryColor,
      pattern: item.pattern,
      fabric: item.fabric,
    }));

    const validIdMap = new Map(availableItems.map((i) => [i._id.toString(), i]));

    if (!this.ai) {
      return this.generateDeterministicOutfits(availableItems, occasion, weather);
    }

    try {
      const prompt = `
You are DHORA's Personal Fashion Stylist.
Tagline: "Style-ta Dhoro, Nijer Moto Cholo"

Target Occasion: "${occasion}"
Weather: ${weather ? `${weather.temperature}°C, ${weather.condition}, Humidity: ${weather.humidity}%` : 'Normal'}
Style Preferences: ${stylePrefs ? JSON.stringify(stylePrefs) : 'Smart Casual & Minimalist'}

CRITICAL STRICT RULE:
You MUST ONLY create outfit combinations using the clothes listed below.
NEVER invent any clothing item or use an ID not in this list.
Each outfit must have at least one TOP (or TRADITIONAL) and one BOTTOM (unless a full dress/panjabi), plus matching footwear if available.

Available Wardrobe Inventory:
${JSON.stringify(inventory, null, 2)}

Return a JSON array of 1 to 3 outfit proposals matching this structure:
[
  {
    "title": "Title of outfit (e.g. Sharp Minimalist Campus Look)",
    "occasion": "${occasion}",
    "rationale": "Why these specific clothes pair well aesthetically and suit the weather.",
    "items": [
      { "clothingItemId": "exact id from inventory", "role": "TOP" },
      { "clothingItemId": "exact id from inventory", "role": "BOTTOM" },
      { "clothingItemId": "exact id from inventory", "role": "SHOES" }
    ]
  }
]
Return strictly JSON only without markdown formatting.`;

      const text = await this.generateWithFallback([{ text: prompt }]);
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed: GroundedOutfitProposal[] = JSON.parse(cleanJson);

      // Deterministic validation: verify every single item belongs to user
      const validatedOutfits: GroundedOutfitProposal[] = [];

      for (const outfit of parsed) {
        const verifiedItems = (outfit.items || []).filter((item) =>
          validIdMap.has(item.clothingItemId)
        );

        if (verifiedItems.length >= 2) {
          validatedOutfits.push({
            title: outfit.title || 'Curated Closet Look',
            occasion: outfit.occasion || occasion,
            rationale: outfit.rationale || 'Grounded stylish combination.',
            items: verifiedItems,
          });
        }
      }

      if (validatedOutfits.length > 0) {
        return validatedOutfits;
      }

      return this.generateDeterministicOutfits(availableItems, occasion, weather);
    } catch (err: any) {
      console.warn('[Gemini Outfit Gen Error]:', err.message);
      return this.generateDeterministicOutfits(availableItems, occasion, weather);
    }
  }

  public async chatStylist(
    history: { sender: string; text: string }[],
    userMessage: string,
    availableItems: IClothingItem[],
    weather?: WeatherData
  ): Promise<{
    replyText: string;
    suggestedOutfit?: GroundedOutfitProposal;
  }> {
    const inventory = availableItems.map((item) => ({
      id: item._id.toString(),
      name: item.name,
      category: item.category,
      subcategory: item.subcategory,
      color: item.primaryColor,
      pattern: item.pattern,
      fabric: item.fabric,
    }));

    const validIdMap = new Map(availableItems.map((i) => [i._id.toString(), i]));

    if (!this.ai) {
      const fallbackOutfit = this.generateDeterministicOutfits(availableItems, 'Stylist Request', weather)[0];
      return {
        replyText: `Assalamu Alaikum! Based on your query "${userMessage}" and current ${weather ? `${weather.temperature}°C` : 'Dhaka'} weather, here is an outfit selected directly from your closet:`,
        suggestedOutfit: fallbackOutfit,
      };
    }

    try {
      const prompt = `
You are DHORA AI Stylist ("Style-ta Dhoro, Nijer Moto Cholo").
You are a warm, knowledgeable fashion consultant familiar with Bangladeshi urban fashion, local weather, and versatile wardrobes.
Answer the user's styling question. If the user asks for an outfit recommendation, pick 1 outfit from the user's available inventory below.

CRITICAL RULE:
You MUST ONLY recommend clothing item IDs from the provided inventory. NEVER invent items.
Weather Context: ${weather ? `${weather.temperature}°C, ${weather.condition}` : 'Pleasant'}

Available Inventory:
${JSON.stringify(inventory, null, 2)}

User Question: "${userMessage}"

Respond in JSON with this structure:
{
  "replyText": "Your empathetic and knowledgeable styling advice",
  "suggestedOutfit": {
    "title": "Outfit title",
    "occasion": "Occasion name",
    "rationale": "Why this specific combination works",
    "items": [
      { "clothingItemId": "exact id from inventory", "role": "TOP" },
      { "clothingItemId": "exact id from inventory", "role": "BOTTOM" },
      { "clothingItemId": "exact id from inventory", "role": "SHOES" }
    ]
  }
}
Return strictly JSON only.`;

      const text = await this.generateWithFallback([{ text: prompt }]);
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      let verifiedOutfit: GroundedOutfitProposal | undefined = undefined;

      if (parsed.suggestedOutfit && Array.isArray(parsed.suggestedOutfit.items)) {
        const validItems = parsed.suggestedOutfit.items.filter((it: any) =>
          validIdMap.has(it.clothingItemId)
        );

        if (validItems.length >= 2) {
          verifiedOutfit = {
            title: parsed.suggestedOutfit.title || 'Curated Closet Combination',
            occasion: parsed.suggestedOutfit.occasion || 'Requested Look',
            rationale: parsed.suggestedOutfit.rationale || 'Tailored to your wardrobe.',
            items: validItems,
          };
        }
      }

      if (!verifiedOutfit && availableItems.length >= 2) {
        verifiedOutfit = this.generateDeterministicOutfits(availableItems, 'Daily Casual', weather)[0];
      }

      return {
        replyText: parsed.replyText || 'Here is an outfit tailored from your closet:',
        suggestedOutfit: verifiedOutfit,
      };
    } catch (err: any) {
      console.warn('[Gemini Chat Error]:', err.message);
      const fallbackOutfit = this.generateDeterministicOutfits(availableItems, 'Styling Request', weather)[0];
      return {
        replyText: `Assalamu Alaikum! Here is a balanced outfit curated from your active closet:`,
        suggestedOutfit: fallbackOutfit,
      };
    }
  }

  // Deterministic rule-based outfit matcher as guarantee
  private generateDeterministicOutfits(
    items: IClothingItem[],
    occasion: string,
    weather?: WeatherData
  ): GroundedOutfitProposal[] {
    const tops = items.filter((i) => i.category === 'TOPS' || i.category === 'TRADITIONAL');
    const bottoms = items.filter((i) => i.category === 'BOTTOMS');
    const shoes = items.filter((i) => i.category === 'FOOTWEAR');
    const accessories = items.filter((i) => i.category === 'ACCESSORIES');

    const top = tops[0] || items[0];
    const bottom = bottoms[0] || items[1] || items[0];
    const shoe = shoes[0];
    const acc = accessories[0];

    const outfitItems: GroundedOutfitProposal['items'] = [
      {
        clothingItemId: top._id.toString(),
        role: top.category === 'TRADITIONAL' ? 'TOP' : 'TOP',
      },
      {
        clothingItemId: bottom._id.toString(),
        role: 'BOTTOM',
      },
    ];

    if (shoe) {
      outfitItems.push({
        clothingItemId: shoe._id.toString(),
        role: 'SHOES',
      });
    }

    if (acc) {
      outfitItems.push({
        clothingItemId: acc._id.toString(),
        role: 'ACCESSORY',
      });
    }

    return [
      {
        title: `${occasion} Grounded Look`,
        occasion,
        rationale: `Pairing ${top.name} with ${bottom.name} provides clean visual contrast. Crafted 100% from your verified closet for ${weather ? `${weather.temperature}°C` : 'current'} conditions.`,
        items: outfitItems,
      },
    ];
  }

  private sanitizeCategory(cat: string): RecognizedAttributes['category'] {
    const valid = [
      'TOPS',
      'BOTTOMS',
      'DRESSES',
      'OUTERWEAR',
      'FOOTWEAR',
      'ACCESSORIES',
      'TRADITIONAL',
    ];
    const upper = (cat || '').toUpperCase();
    return valid.includes(upper) ? (upper as any) : 'TOPS';
  }

  private generateHeuristicAttributes(identifier: string): RecognizedAttributes {
    const isFootwear = identifier.includes('shoe') || identifier.includes('foot');
    const isBottom = identifier.includes('pant') || identifier.includes('jean');
    const isTrad = identifier.includes('panjabi') || identifier.includes('saree');

    if (isFootwear) {
      return {
        name: 'Handcrafted Tan Penny Loafers',
        category: 'FOOTWEAR',
        subcategory: 'Loafers',
        primaryColor: 'Tan Brown',
        secondaryColors: ['Dark Brown'],
        pattern: 'Solid',
        fabric: 'Leather',
        seasonality: 'ALL_SEASON',
        formalness: 'SMART_CASUAL',
      };
    }

    if (isBottom) {
      return {
        name: 'Dark Indigo Selvedge Raw Denim',
        category: 'BOTTOMS',
        subcategory: 'Jeans',
        primaryColor: 'Indigo Blue',
        secondaryColors: [],
        pattern: 'Solid',
        fabric: 'Denim',
        seasonality: 'ALL_SEASON',
        formalness: 'CASUAL',
      };
    }

    if (isTrad) {
      return {
        name: 'White Embroidered Cotton Panjabi',
        category: 'TRADITIONAL',
        subcategory: 'Panjabi',
        primaryColor: 'White',
        secondaryColors: ['Gold'],
        pattern: 'Embroidered',
        fabric: 'Fine Cotton',
        seasonality: 'ALL_SEASON',
        formalness: 'FESTIVE',
      };
    }

    return {
      name: 'Black Minimalist Mandarin Collar Shirt',
      category: 'TOPS',
      subcategory: 'Shirt',
      primaryColor: 'Black',
      secondaryColors: [],
      pattern: 'Solid',
      fabric: 'Cotton Blend',
      seasonality: 'ALL_SEASON',
      formalness: 'SMART_CASUAL',
    };
  }

  public async generateTripPlanWithAI(
    destination: string,
    durationDays: number,
    activities: string[],
    availableItems: any[]
  ): Promise<{
    forecastSummary: string;
    weatherTemperature: number;
    weatherCondition: string;
    packedItemIds: string[];
    plannedOutfits: {
      dayNumber: number;
      activity: string;
      outfitTitle: string;
      itemIds: string[];
    }[];
    reusableItemsNotes: string;
    hasMissingWeatherItems: boolean;
    missingItemsAdvice?: string;
    missingItemsList: string[];
  }> {
    const inventory = availableItems.map((item) => ({
      id: item._id ? item._id.toString() : item.id,
      name: item.name,
      category: item.category,
      subcategory: item.subcategory,
      color: item.primaryColor,
      fabric: item.fabric,
    }));

    const validIdSet = new Set(inventory.map((i) => i.id));
    const destLower = destination.toLowerCase();
    const isColdDestination =
      destLower.includes('sajek') ||
      destLower.includes('darjeeling') ||
      destLower.includes('bandarban') ||
      destLower.includes('kashmir') ||
      destLower.includes('pokhara') ||
      destLower.includes('winter') ||
      destLower.includes('shit') ||
      destLower.includes('thanda') ||
      destLower.includes('hill');

    const hasOuterwear = availableItems.some(
      (i) =>
        i.category === 'OUTERWEAR' ||
        /jacket|hoodie|sweater|coat|fleece|blazer|cardigan|shawl/i.test(i.name)
    );

    if (this.ai) {
      try {
        const prompt = `
You are DHORA AI Smart Trip Stylist & Backpack Packing Consultant ("Style-ta Dhoro, Nijer Moto Cholo").
User is planning a trip to "${destination}" for ${durationDays} days.
Activities: ${activities.join(', ')}

Available Closet Items:
${JSON.stringify(inventory, null, 2)}

TASK:
1. Estimate travel climate for "${destination}" (typical temperature in °C, e.g. Sajek/hills 14°C cold night fog, Cox's Bazar 30°C sunny beach).
2. Select capsule items from available closet (mix-and-match tops, bottoms, shoes).
3. Create a daily outfit for each day (Day 1 to ${durationDays}) referencing ONLY IDs from available closet items.
4. MISSING WEATHER ESSENTIALS:
Analyze whether "${destination}" weather requires items MISSING from the user's closet!
Specifically, if the destination is cold or has chilly nights (like Sajek, Darjeeling, hills, winter) and the user has NO jacket/hoodie/sweater in their closet:
- set "hasMissingWeatherItems": true
- set "missingItemsList": ["Heavy Fleece Hoodie / Windbreaker Jacket", "Woolen Socks & Beanie", "Thermal Inner Wear"]
- set "missingItemsAdvice": Write a direct, helpful explanation in Bengali/Banglish:
  "${destination}-e shondha o rate besh shit thakbe. Kintu apnar digital wardrobe-e kono jacket, hoodie ba warm layer nei! Trip-e thanda theke bachte oboshoy ekta warm hoodie ba jacket kine nin othoba DHORA Rent theke rent kore nin!"

Return JSON matching:
{
  "forecastSummary": "...",
  "weatherTemperature": 15,
  "weatherCondition": "...",
  "packedItemIds": ["id1", "id2"],
  "plannedOutfits": [
    {
      "dayNumber": 1,
      "activity": "...",
      "outfitTitle": "...",
      "itemIds": ["id1", "id2"]
    }
  ],
  "reusableItemsNotes": "...",
  "hasMissingWeatherItems": ${isColdDestination && !hasOuterwear},
  "missingItemsAdvice": "...",
  "missingItemsList": ["..."]
}
Return JSON only.`;

        const responseText = await this.generateWithFallback([{ text: prompt }]);
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        const verifiedPacked = (parsed.packedItemIds || []).filter((id: string) =>
          validIdSet.has(id)
        );

        const verifiedOutfits = (parsed.plannedOutfits || []).map((o: any, idx: number) => ({
          dayNumber: o.dayNumber || idx + 1,
          activity: o.activity || `Day ${idx + 1} Activity`,
          outfitTitle: o.outfitTitle || `Day ${idx + 1} Capsule Look`,
          itemIds: (o.itemIds || []).filter((id: string) => validIdSet.has(id)),
        }));

        return {
          forecastSummary:
            parsed.forecastSummary || `Expected travel climate for ${destination}`,
          weatherTemperature: parsed.weatherTemperature || (isColdDestination ? 15 : 29),
          weatherCondition:
            parsed.weatherCondition || (isColdDestination ? 'Chilly Mountain Breeze' : 'Sunny & Pleasant'),
          packedItemIds: verifiedPacked.length > 0 ? verifiedPacked : inventory.map((i) => i.id),
          plannedOutfits: verifiedOutfits.length > 0 ? verifiedOutfits : [],
          reusableItemsNotes:
            parsed.reusableItemsNotes ||
            'Bottoms and footwear are rotated across days to keep luggage compact.',
          hasMissingWeatherItems:
            parsed.hasMissingWeatherItems !== undefined
              ? parsed.hasMissingWeatherItems
              : isColdDestination && !hasOuterwear,
          missingItemsAdvice:
            parsed.missingItemsAdvice ||
            (isColdDestination && !hasOuterwear
              ? `${destination}-e shondha o rate besh thanda pore (14°C - 16°C). Kintu apnar digital wardrobe-e kono jacket ba hoodie nei! Trip-e thanda theke bachte oboshoy ekta warm hoodie ba jacket kine nin othoba DHORA Rent theke rent kore nin!`
              : undefined),
          missingItemsList:
            parsed.missingItemsList && parsed.missingItemsList.length > 0
              ? parsed.missingItemsList
              : isColdDestination && !hasOuterwear
              ? ['Heavy Fleece Hoodie / Windbreaker Jacket', 'Woolen Socks', 'Thermal Base Layer']
              : [],
        };
      } catch (err: any) {
        console.warn('[Gemini Trip Stylist Warning]:', err.message);
      }
    }

    // Deterministic fallback
    const tops = availableItems.filter(
      (i) => i.category === 'TOPS' || i.category === 'TRADITIONAL'
    );
    const bottoms = availableItems.filter((i) => i.category === 'BOTTOMS');
    const shoes = availableItems.filter((i) => i.category === 'FOOTWEAR');

    const packedTops = tops.slice(0, Math.min(tops.length, durationDays));
    const packedBottoms = bottoms.slice(0, Math.min(bottoms.length, 2));
    const packedShoes = shoes.slice(0, 1);
    const packedList = [...packedTops, ...packedBottoms, ...packedShoes];

    const plannedOutfits = [];
    for (let day = 1; day <= durationDays; day++) {
      const top = packedTops[(day - 1) % packedTops.length] || availableItems[0];
      const bottom =
        packedBottoms[(day - 1) % packedBottoms.length] || availableItems[1] || availableItems[0];
      const shoe = packedShoes[0];
      plannedOutfits.push({
        dayNumber: day,
        activity: activities[day - 1] || `Day ${day} Exploration & Dining`,
        outfitTitle: `Day ${day}: ${top.name} + ${bottom.name}`,
        itemIds: [top._id ? top._id.toString() : top.id, bottom._id ? bottom._id.toString() : bottom.id, ...(shoe ? [shoe._id ? shoe._id.toString() : shoe.id] : [])],
      });
    }

    return {
      forecastSummary: isColdDestination
        ? `Chilly mountain climate expected in ${destination}. Night temperatures drop to 14°C - 16°C.`
        : `Pleasant travel weather in ${destination} (~28°C - 30°C).`,
      weatherTemperature: isColdDestination ? 15 : 29,
      weatherCondition: isColdDestination ? 'Chilly & Misty Nights' : 'Sunny & Warm',
      packedItemIds: packedList.map((i) => (i._id ? i._id.toString() : i.id)),
      plannedOutfits,
      reusableItemsNotes: `Your ${packedBottoms[0]?.name || 'pants'} can be comfortably reworn across multiple days.`,
      hasMissingWeatherItems: isColdDestination && !hasOuterwear,
      missingItemsAdvice:
        isColdDestination && !hasOuterwear
          ? `${destination}-e shondha o rate besh shit thakbe (14°C - 16°C). Kintu apnar digital wardrobe-e kono jacket, hoodie ba winter wear nei! Eita na thakle trip-e thanda lagbe. Trip-e jawar agey oboshoy ekta Heavy Fleece Hoodie ba Windbreaker Jacket ar Woolen Socks kine nin ba DHORA Rent theke rent kore nin!`
          : undefined,
      missingItemsList:
        isColdDestination && !hasOuterwear
          ? ['Heavy Fleece Hoodie / Windbreaker Jacket', 'Woolen Socks', 'Thermal Base Layer']
          : [],
    };
  }

  public async analyzeBeforeYouBuyWithAI(
    productName: string,
    category: string,
    primaryColor: string,
    price: number | undefined,
    userItems: any[]
  ): Promise<{
    verdict: 'BUY' | 'CONSIDER_ALTERNATIVE' | 'SKIP_DUPLICATE';
    compatibilityScore: number;
    recommendationBadge:
      | 'Fits Your Wardrobe'
      | 'Similar Item Already Exists'
      | 'Limited Combinations'
      | 'High-Versatility Staple';
    newCombinationsCount: number;
    similarItemNames: string[];
    aiValuableComment: string;
    stylingRationale: string;
    compatibleItemNames: string[];
  }> {
    const inventory = userItems.map((item) => ({
      id: item._id ? item._id.toString() : item.id,
      name: item.name,
      category: item.category,
      subcategory: item.subcategory,
      color: item.primaryColor,
      fabric: item.fabric,
    }));

    const targetCat = (category || 'TOPS').toUpperCase();
    const targetCol = (primaryColor || 'Neutral').toLowerCase();

    // Deterministic check for duplicate
    const similarDeterministic = userItems.filter(
      (item) =>
        item.category?.toUpperCase() === targetCat &&
        (item.primaryColor?.toLowerCase().includes(targetCol) ||
          targetCol.includes(item.primaryColor?.toLowerCase()) ||
          productName.toLowerCase().includes(item.name?.toLowerCase()) ||
          (item.name && item.name.toLowerCase().includes(productName.toLowerCase())))
    );

    const counterparts = userItems.filter((i) =>
      targetCat === 'TOPS' || targetCat === 'TRADITIONAL'
        ? i.category === 'BOTTOMS'
        : targetCat === 'BOTTOMS'
        ? i.category === 'TOPS' || i.category === 'TRADITIONAL'
        : i.category === 'TOPS' || i.category === 'BOTTOMS'
    );

    if (this.ai) {
      try {
        const prompt = `
You are DHORA AI's "Before You Buy" Fashion & Wardrobe Advisor ("Style-ta Dhoro, Nijer Moto Cholo").
A user is contemplating buying this prospective clothing item:
- Item: "${productName}"
- Category: "${targetCat}"
- Color: "${primaryColor || 'Neutral'}"
- Price: ${price ? `৳${price}` : 'Not specified'}

User's Existing Wardrobe Inventory:
${JSON.stringify(inventory, null, 2)}

TASK:
1. Duplicate / Similarity Check:
Does the user ALREADY own something very similar in category, silhouette, or color?
List exact similar item names from inventory.

2. Versatility & Pairing:
How many distinct new outfit pairings does this unlock with user's existing clothes? Which items pair well?

3. Buying Verdict:
- "SKIP_DUPLICATE" if they already own an almost identical item in color & category.
- "CONSIDER_ALTERNATIVE" if they have something similar, or if a complementary color would be better.
- "BUY" if it fills a wardrobe gap or creates multiple strong looks.

4. Short, Punchy, High-Value Bengali/Banglish Styling Comment:
Write 2-3 sentences in natural, insightful Bangladeshi Bengali/Banglish:
- Be direct: say whether they already have something similar or if it's a great purchase.
- Give a specific styling tip with their actual closet items.
- Example: "Apnar closet-e already similar Black Shirt ache! Kalo-r poriborte Olive Green ba Beige kinle Yellow Chinos-er shathe darun versatile looks paben."

Return strictly JSON matching:
{
  "verdict": "BUY",
  "compatibilityScore": 88,
  "recommendationBadge": "Fits Your Wardrobe",
  "newCombinationsCount": 4,
  "similarItemNames": [],
  "aiValuableComment": "...",
  "stylingRationale": "...",
  "compatibleItemNames": ["..."]
}
Return JSON only.`;

        const responseText = await this.generateWithFallback([{ text: prompt }]);
        const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);

        return {
          verdict: parsed.verdict || (similarDeterministic.length > 0 ? 'SKIP_DUPLICATE' : 'BUY'),
          compatibilityScore: parsed.compatibilityScore || 85,
          recommendationBadge:
            parsed.recommendationBadge ||
            (similarDeterministic.length > 0 ? 'Similar Item Already Exists' : 'Fits Your Wardrobe'),
          newCombinationsCount: parsed.newCombinationsCount || Math.min(counterparts.length * 2, 6),
          similarItemNames:
            parsed.similarItemNames && parsed.similarItemNames.length > 0
              ? parsed.similarItemNames
              : similarDeterministic.map((i) => i.name),
          aiValuableComment:
            parsed.aiValuableComment ||
            (similarDeterministic.length > 0
              ? `Apnar closet-e already similar "${similarDeterministic[0].name}" ache! Duplicate na kine complementary color ba missing staple kinle wardrobe-e beshi versatility paben.`
              : `Darun choice! Eita apnar closet-er ${counterparts[0]?.name || 'clothes'}-er shathe darun match korbe ebong notun outfits toiri korbe.`),
          stylingRationale: parsed.stylingRationale || 'Grounded wardrobe compatibility analysis.',
          compatibleItemNames:
            parsed.compatibleItemNames && parsed.compatibleItemNames.length > 0
              ? parsed.compatibleItemNames
              : counterparts.slice(0, 3).map((i) => i.name),
        };
      } catch (err: any) {
        console.warn('[Gemini Before-You-Buy Warning]:', err.message);
      }
    }

    // Deterministic Fallback
    const hasDuplicate = similarDeterministic.length > 0;
    const verdict = hasDuplicate ? 'SKIP_DUPLICATE' : counterparts.length === 0 ? 'CONSIDER_ALTERNATIVE' : 'BUY';
    const badge = hasDuplicate
      ? 'Similar Item Already Exists'
      : counterparts.length === 0
      ? 'Limited Combinations'
      : 'Fits Your Wardrobe';
    const score = hasDuplicate ? 55 : counterparts.length === 0 ? 45 : Math.min(75 + counterparts.length * 6, 95);
    const newCombos = Math.min(counterparts.length * 2, 6);

    const comment = hasDuplicate
      ? `Apnar wardrobe-e already similar "${similarDeterministic[0].name}" ache! Duplicate na kine onno complementary color ba jacket kinle closet-e beshi versatility paben.`
      : counterparts.length === 0
      ? `Piece-ta shundor, kintu apnar closet-e eitar shathe porar moto matching kapor nei. Eita kinle shathe matching bottoms/tops lagbe.`
      : `Darun choice! Eita apnar closet-er ${counterparts.slice(0, 2).map((c) => c.name).join(' ar ')}-er shathe darun match korbe ebong ${newCombos}-ti notun outfit unlock korbe.`;

    return {
      verdict,
      compatibilityScore: score,
      recommendationBadge: badge,
      newCombinationsCount: newCombos,
      similarItemNames: similarDeterministic.map((i) => i.name),
      aiValuableComment: comment,
      stylingRationale: `Wardrobe evaluation against your ${userItems.length} digitized clothing items.`,
      compatibleItemNames: counterparts.slice(0, 3).map((i) => i.name),
    };
  }
}

export const geminiService = new GeminiService();
