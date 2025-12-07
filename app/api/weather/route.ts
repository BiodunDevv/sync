import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get("city");
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Weather service not configured" },
        { status: 500 }
      );
    }

    let url = "https://api.openweathermap.org/data/2.5/weather?";

    if (city) {
      url += `q=${encodeURIComponent(city)}`;
    } else if (lat && lon) {
      url += `lat=${lat}&lon=${lon}`;
    } else {
      return NextResponse.json(
        { error: "Please provide either city name or coordinates" },
        { status: 400 }
      );
    }

    url += `&appid=${apiKey}&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const errorMessage =
        error.message ||
        (response.status === 404
          ? "City not found. Please check the spelling and try again."
          : "Failed to fetch weather data");

      return NextResponse.json(
        { error: errorMessage },
        { status: 200 } // Return 200 so the client can handle the error gracefully
      );
    }

    const data = await response.json();

    return NextResponse.json({
      location: {
        name: data.name,
        country: data.sys.country,
        coordinates: {
          lat: data.coord.lat,
          lon: data.coord.lon,
        },
      },
      weather: {
        main: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
      },
      temperature: {
        current: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        min: Math.round(data.main.temp_min),
        max: Math.round(data.main.temp_max),
      },
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind: {
        speed: data.wind.speed,
        deg: data.wind.deg,
      },
      clouds: data.clouds.all,
      visibility: data.visibility,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      timezone: data.timezone,
    });
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
