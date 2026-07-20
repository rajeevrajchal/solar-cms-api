import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SolarService {
  async getAverageSunlightHours(
    latitude: number,
    longitude: number,
  ): Promise<{ summer: number; winter: number; monsoon: number }> {
    try {
      const url = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=ALLSKY_SFC_SW_DWN&community=SB&longitude=${longitude}&latitude=${latitude}&start=20230101&end=20231231&format=JSON`;
      const response = await axios.get(url);
      const solarData = response.data?.properties?.parameter?.ALLSKY_SFC_SW_DWN;

      let totalSunHoursSummer = 0;
      let totalSunHoursWinter = 0;
      let totalSunHoursMonsoon = 0;
      let totalDaysSummer = 0;
      let totalDaysWinter = 0;
      let totalDaysMonsoon = 0;

      if (solarData) {
        for (const date in solarData) {
          const solarRadiation = solarData[date];
          const month = parseInt(date.substring(4, 6)); // Extract month from the date

          // Calculate total sunlight hours and total days for each season
          if (month >= 6 && month <= 8) {
            if (solarRadiation > 0) {
              totalSunHoursMonsoon += solarRadiation;
              totalDaysMonsoon++;
            }
          } else if (month >= 4 && month <= 5) {
            if (solarRadiation > 0) {
              totalSunHoursSummer += solarRadiation;
              totalDaysSummer++;
            }
          } else {
            if (solarRadiation > 0) {
              totalSunHoursWinter += solarRadiation;
              totalDaysWinter++;
            }
          }
        }
      }

      // Calculate average sunlight hours per day for each season and convert to hours
      const avgSunHoursSummer = totalSunHoursSummer / (totalDaysSummer * 24);
      const avgSunHoursWinter = totalSunHoursWinter / (totalDaysWinter * 24);
      const avgSunHoursMonsoon = totalSunHoursMonsoon / (totalDaysMonsoon * 24);

      return {
        summer: avgSunHoursSummer,
        winter: avgSunHoursWinter,
        monsoon: avgSunHoursMonsoon,
      };
    } catch (_error) {
      throw new Error('Failed to fetch sunlight hours');
    }
  }
}
