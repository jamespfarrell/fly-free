import { FlightInfo, FlightDetails } from './types';

function removeTerminals(str: string): string {
    const regex = /^(.*) \(Terminal .*\)$/;
    const match = str.match(regex);
    if (match) {
      return match[1]; // return the captured group
    } else {
      return str; // return the original string if there's no match
    }
  }

//replacing FlightInfo
export function getEasyJetDetails(html: string): [boolean, FlightDetails | undefined] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    try {
        const itinerary = doc.querySelector("#ej-itinerary");
        if (!itinerary) {
            throw new Error("Invalid HTML: Could not find itinerary");
        }

        const tds = itinerary.querySelectorAll("td");
        const airports = tds[2]; 
        if (!airports) {
            throw new Error("Invalid HTML: Could not find airports");
        }
        const flightNumber = tds[3].textContent?.trim();
    
        const airportsText = airports.textContent?.trim();
        if (!airportsText) {
            throw new Error("Invalid HTML: Could not find airport names");
        }
    
        const airportNames = airportsText.split(" to ");
        if (airportNames.length !== 2) {
            throw new Error("Invalid HTML: Could not parse airport names");
        }
    
        const departureAirport = airportNames[0] ? removeTerminals(airportNames[0].trim()) : undefined;
        const arrivalAirport = airportNames[1] ? removeTerminals(airportNames[1].trim()) : undefined;
    
        if (!departureAirport) {
            throw new Error("Invalid HTML: departureAirport not defined");
        }
        if (!arrivalAirport) {
            throw new Error("Invalid HTML: arrivalAirport not defined");
        }
        
        const departs = tds[9].textContent?.trim();
        const arrives = tds[11].textContent?.trim();
        
        if (!departs) {
            throw new Error("Invalid HTML: departs not defined");
        }
        if (!arrives) {
            throw new Error("Invalid HTML: arrives not defined");
        }

        const departureDate = new Date(departs);
        const arrivalDate = new Date(arrives);

         const departureDateTimeString = departureDate.toISOString();
         const arrivalDateTimeString = arrivalDate.toISOString();
    
         const durationInMinutes = Math.round((Date.parse(arrivalDateTimeString) - Date.parse(departureDateTimeString)) / 1000 / 60);
         const durationHours = Math.floor(durationInMinutes / 60);
         const durationMinutes = durationInMinutes % 60;
         const flightDuration = `${durationHours}h ${durationMinutes}m`;
         const departureDateFormatted = departureDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
         const arrivalDateFormatted = departureDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

        //// dateTime: departureDate,
        return [true,
            {
            from: departureAirport.trim(),
            destination: arrivalAirport.trim(),
            departure: {
                dateFormatted: departureDateFormatted
            },
            arrival: {
                dateFormatted: arrivalDateFormatted
            },
            airline: {
                name: 'EasyJet',
                logo: 'ej.png'
            }
          }];
    } catch(error: unknown) {
        return [false, undefined]
    }

    
    // return {
    //   departureAirport: departureAirport.trim(),
    //   arrivalAirport: arrivalAirport.trim(),
    //   departureDateTime: '1:00',
    //   arrivalDateTime: '1:00',
    //   flightDuration: '1:00',
    //   airline: {
    //     name: 'EasyJet',
    //     logo: 'klm.png'
    //   }
    // };
  }