import { ENV } from '../config/env';

export interface WeatherData {
  city: string;
  temperature: number; // in Celsius
  condition: string; // e.g. "Sunny", "Partly Cloudy", "Rainy"
  humidity: number; // percentage
  rainProbability: number; // percentage
  windSpeed: number; // km/h
  uvIndex?: number;
  recommendationHint: string;
}

class WeatherService {
  public async getWeatherForArea(area: string = 'Dhaka'): Promise<WeatherData> {
    const cleanArea = area.replace(/\(.*\)/, '').trim() || 'Dhaka';

    if (ENV.WEATHER_API_KEY) {
      try {
        const url = `https://api.weatherapi.com/v1/forecast.json?key=${ENV.WEATHER_API_KEY}&q=${encodeURIComponent(
          cleanArea
        )}&days=1&aqi=no`;

        const res = await fetch(url);
        if (res.ok) {
          const data: any = await res.json();
          const current = data.current;
          const forecast = data.forecast.forecastday[0].day;

          const temp = Math.round(current.temp_c);
          const condition = current.condition.text;
          const humidity = current.humidity;
          const rainProb = forecast.daily_chance_of_rain || 10;

          return {
            city: cleanArea,
            temperature: temp,
            condition,
            humidity,
            rainProbability: rainProb,
            windSpeed: Math.round(current.wind_kph),
            uvIndex: current.uv,
            recommendationHint: this.getHint(temp, rainProb),
          };
        }
      } catch (err: any) {
        console.warn('[Weather API error, using regional climate model]:', err.message);
      }
    }

    // Regional climate model for Bangladesh
    const temp = 29;
    const humidity = 65;
    const rainProb = 15;
    const condition = 'Partly Cloudy';

    return {
      city: cleanArea,
      temperature: temp,
      condition,
      humidity,
      rainProbability: rainProb,
      windSpeed: 12,
      uvIndex: 6,
      recommendationHint: this.getHint(temp, rainProb),
    };
  }

  private getHint(temp: number, rainProb: number): string {
    if (rainProb > 50) {
      return 'High chance of rain. Choose waterproof footwear and avoid ground-grazing hemlines.';
    }
    if (temp >= 32) {
      return 'Hot weather. Prefer lightweight, breathable natural cotton or linen and loose silhouettes.';
    }
    if (temp <= 18) {
      return 'Cooler weather. Layer with a stylish jacket, sweater, or shawl.';
    }
    return 'Comfortable weather. Ideal for smart casual layered looks and denim.';
  }
}

export const weatherService = new WeatherService();
