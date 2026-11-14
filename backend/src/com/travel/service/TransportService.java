package com.travel.service;

import com.travel.model.BusSchedule;
import com.travel.model.CabOption;
import com.travel.model.TrainSchedule;
import com.travel.model.TransitLeg;

import java.util.ArrayList;
import java.util.List;

public class TransportService {

    public static List<TrainSchedule> getTrainSchedules(String origin, String destination) {
        return TrainService.getSchedules(origin, destination);
    }

    public static List<BusSchedule> getBusSchedules(String origin, String destination) {
        List<BusSchedule> list = new ArrayList<>();
        String orig = (origin != null && !origin.trim().isEmpty()) ? origin.trim() : "Origin";
        String dest = (destination != null && !destination.trim().isEmpty()) ? destination.trim() : "Destination";

        String origL = orig.toLowerCase();
        String destL = dest.toLowerCase();

        if (destL.contains("araku") || destL.contains("aaraku")) {
            list.add(new BusSchedule(
                    "APSRTC-9412",
                    "APSRTC Amaravati / Garuda Plus AC",
                    "Multi-Axle Semi-Sleeper AC (2+2)",
                    (origL.contains("amaravathi") || origL.contains("vijayawada")) ? "Amaravathi Bus Stand / PNBS Bay 14" : orig + " RTC Central Bus Station",
                    "Araku Valley Main Complex Depot",
                    "06:00 AM", "12:15 PM", "6h 15m",
                    480.0, 22,
                    "AC, Pushback Seats, Water Bottle, USB Mobile Charging, Live GPS"
            ));
            list.add(new BusSchedule(
                    "APSRTC-3820",
                    "APSRTC Super Luxury Non-AC",
                    "Air Suspension Super Luxury (2+2)",
                    orig + " Main Bus Station",
                    "Araku Valley RTC Bus Stand",
                    "07:30 AM", "02:00 PM", "6h 30m",
                    290.0, 31,
                    "Air Suspension, Reclining Seats, Luggage Carrier"
            ));
            list.add(new BusSchedule(
                    "ORANGE-7840",
                    "Orange Tours & Hill Travels",
                    "AC Sleeper (2+1) High Comfort",
                    orig + " Bypass Pickup Point",
                    "Araku Valley Hill Resort Junction",
                    "09:30 PM", "05:15 AM (Next Morning)", "7h 45m",
                    750.0, 12,
                    "Blanket & Pillow, Charging Port, Reading Light, Mineral Water"
            ));
            list.add(new BusSchedule(
                    "KAVERI-1120",
                    "Kaveri Sleeper Coach Express",
                    "Bharat Benz AC Diamond Sleeper",
                    orig + " Town Bus Stand",
                    "Araku Valley Gateway Stop",
                    "10:45 PM", "06:15 AM (Next Morning)", "7h 30m",
                    690.0, 8,
                    "AC Sleeper, Clean Linens, Live Vehicle Tracking, CCTV"
            ));
            return list;
        }

        // Generic dynamic bus schedule for any other Indian city or village
        list.add(new BusSchedule(
                "APSRTC-5120",
                "State RTC Amaravati Volvo Multi-Axle",
                "Volvo AC Multi-Axle Executive (2+2)",
                orig + " Central Bus Terminal",
                dest + " Main Inter-State Bus Terminus",
                "06:30 AM", "01:00 PM", "6h 30m",
                520.0, 19,
                "AC, Reclining Seats, Emergency SOS, USB Port, Water Bottle"
        ));
        list.add(new BusSchedule(
                "RTC-EXPRESS-104",
                "State Transport Super Luxury Express",
                "Super Luxury 2+2 Air Suspension",
                orig + " Bus Complex",
                dest + " Bus Stand",
                "08:15 AM", "03:30 PM", "7h 15m",
                320.0, 28,
                "Luggage Boot, Air Suspension Comfort, Mobile Charging"
        ));
        list.add(new BusSchedule(
                "SLEEPER-9910",
                "National Intercity Premium Sleeper",
                "AC Sleeper (2+1) Night Service",
                orig + " Highway Boarding Point",
                dest + " City Drop Center",
                "10:15 PM", "06:00 AM (Next Day)", "7h 45m",
                790.0, 14,
                "Individual AC Vents, Blankets, Reading Lights, GPS Tracking"
        ));

        return list;
    }

    public static List<CabOption> getCabOptions(String origin, String destination, int travelDays, int numTravelers) {
        List<CabOption> list = new ArrayList<>();
        String orig = (origin != null && !origin.trim().isEmpty()) ? origin.trim() : "Origin";
        String dest = (destination != null && !destination.trim().isEmpty()) ? destination.trim() : "Destination";

        int days = Math.max(1, travelDays);
        double sedanBase = 2200.0 * days;
        double suvBase = 3200.0 * days;
        double innovaBase = 3900.0 * days;
        double autoBase = 950.0 * days;
        double bikeBase = 700.0 * days;

        // 1. AC Sedan
        list.add(new CabOption(
                "Maruti Suzuki Swift Dzire / Etios AC",
                "SEDAN",
                "Incredible India Verified Cab Network",
                "4 Passengers + 2 Large Bags",
                sedanBase,
                "₹12/km (Includes 300 km/day)",
                "Driver Allowance Included",
                "Tolls & State Permits Included",
                "Doorstep pickup in 15-30 mins",
                "AC, Clean Sanitized Interior, Commercial Taxi Permit, Audio System"
        ));

        // 2. Premium 7-Seater SUV
        list.add(new CabOption(
                "Toyota Innova Crysta / Ertiga AC",
                "SUV",
                "Coastal & Hill Drive Chauffeurs",
                "6-7 Passengers + 4 Large Bags",
                innovaBase,
                "₹16/km (Includes 300 km/day)",
                "Driver Allowance & Night Halt Included",
                "All Hill Road & Toll Taxes Included",
                "Doorstep pickup at desired time",
                "Captain Seats, Dual AC, Roof Carrier, Experienced Hill Chauffeur"
        ));

        // 3. 4x4 / Explorer SUV (Great for Araku, Ghats, Hills)
        list.add(new CabOption(
                "Mahindra Scorpio-N / Thar 4x4",
                "SUV",
                "Mountain & Valley Safaris",
                "5 Passengers + 3 Bags",
                suvBase,
                "₹15/km",
                "Driver Allowance Included",
                "Tolls Included",
                "Pickup on request",
                "High Ground Clearance, Hill Descent Control, Off-road certified"
        ));

        // 4. Auto Rickshaw / Local Connector (For short hops or budget village transport)
        list.add(new CabOption(
                "Local Passenger Auto Rickshaw / Piaggio Ape",
                "AUTO",
                "Local Tourist Auto Union",
                "3 Passengers + 2 Bags",
                autoBase,
                "Fixed Local Rate",
                "Local Guide Driver",
                "No Tolls",
                "Instant pickup at bus / train station",
                "Open airy village breeze, Local hidden spot recommendations"
        ));

        // 5. Bike / Self-Drive Rental
        list.add(new CabOption(
                "Royal Enfield Himalayan 450 / Classic 350",
                "BIKE",
                "Apex Self-Drive Bike Rentals",
                "1-2 Riders (Dual Helmets Provided)",
                bikeBase,
                "Unlimited km within state",
                "Self-Drive (Security Deposit Required)",
                "State Tax Paid",
                "Pick up at city rental hub",
                "USB Mobile Mount, Crash Guards, 2 ISI Certified Helmets, First Aid Kit"
        ));

        return list;
    }

    public static TransitLeg getOutboundTransit(String origin, String destination, String mode) {
        String orig = (origin != null && !origin.trim().isEmpty()) ? origin.trim() : "Origin";
        String dest = (destination != null && !destination.trim().isEmpty()) ? destination.trim() : "Destination";
        String m = (mode != null) ? mode.toUpperCase() : "TRAIN";

        String title;
        String depTime;
        String arrTime;
        String duration;
        double cost;
        String desc;
        String tips;

        if (m.contains("TRAIN")) {
            title = "Morning Train Outbound Journey: " + orig + " ➔ " + dest;
            depTime = "06:45 AM";
            arrTime = "11:05 AM";
            duration = "4h 20m";
            cost = 380.0;
            desc = "Depart from " + orig + " Railway Junction aboard scenic train to " + dest + ". Enjoy mountain tunnel views and rolling green landscapes.";
            tips = "Board from Platform 1. Keep Govt ID proof handy for TTE ticket verification.";
        } else if (m.contains("BUS")) {
            title = "State RTC / Luxury Express Bus: " + orig + " ➔ " + dest;
            depTime = "06:00 AM";
            arrTime = "12:15 PM";
            duration = "6h 15m";
            cost = 480.0;
            desc = "Board state Volvo / Super Luxury coach from " + orig + " Central Bus Station directly connecting to " + dest + " Bus Complex.";
            tips = "Luggage space available in lower boot. Refreshment breakfast halt at scenic highway junction.";
        } else if (m.contains("CAB") || m.contains("CAR")) {
            title = "Dedicated AC Chauffeur Cab: " + orig + " ➔ " + dest;
            depTime = "06:30 AM";
            arrTime = "11:30 AM";
            duration = "5h 00m";
            cost = 2400.0;
            desc = "Private door-to-door cab pickup from " + orig + ". Flexible stops for breakfast and viewpoints along Ghat roads.";
            tips = "Experienced chauffeur familiar with Ghat curves and hill hairpins.";
        } else if (m.contains("BIKE")) {
            title = "Scenic Motorcycle Ride: " + orig + " ➔ " + dest;
            depTime = "06:00 AM";
            arrTime = "11:45 AM";
            duration = "5h 45m";
            cost = 800.0;
            desc = "Adventurous morning ride crossing scenic rural countryside, delta waterways, and winding Ghat passes.";
            tips = "Wear riding jacket, full-face helmet, and carry rain gear.";
        } else {
            title = "Local Transit: " + orig + " ➔ " + dest;
            depTime = "07:00 AM";
            arrTime = "12:00 PM";
            duration = "5h 00m";
            cost = 600.0;
            desc = "Comfortable point-to-point road connectivity from " + orig + " into " + dest + ".";
            tips = "Start early in the morning to beat rush hour.";
        }

        return new TransitLeg("OUTBOUND", orig, dest, m, title, depTime, arrTime, duration, cost, desc, tips);
    }

    public static TransitLeg getReturnTransit(String origin, String destination, String mode) {
        String orig = (origin != null && !origin.trim().isEmpty()) ? origin.trim() : "Origin";
        String dest = (destination != null && !destination.trim().isEmpty()) ? destination.trim() : "Destination";
        String m = (mode != null) ? mode.toUpperCase() : "TRAIN";

        String title;
        String depTime;
        String arrTime;
        String duration;
        double cost;
        String desc;
        String tips;

        if (m.contains("TRAIN")) {
            title = "Evening Return Train Journey: " + dest + " ➔ " + orig;
            depTime = "04:15 PM";
            arrTime = "09:00 PM";
            duration = "4h 45m";
            cost = 380.0;
            desc = "Depart from " + dest + " Railway Station for comfortable return back to " + orig + ". Relax and reflect on your trip.";
            tips = "Arrive at station 25 minutes prior to departure. Snacks and coffee available on platform.";
        } else if (m.contains("BUS")) {
            title = "Return RTC / Luxury Bus: " + dest + " ➔ " + orig;
            depTime = "04:30 PM";
            arrTime = "10:45 PM";
            duration = "6h 15m";
            cost = 480.0;
            desc = "Board return bus from " + dest + " Bus Depot directly returning to " + orig + ".";
            tips = "Dinner break scheduled at highway motel at 08:30 PM.";
        } else if (m.contains("CAB") || m.contains("CAR")) {
            title = "Return Private Cab Drop: " + dest + " ➔ " + orig;
            depTime = "04:00 PM";
            arrTime = "09:00 PM";
            duration = "5h 00m";
            cost = 2400.0;
            desc = "Direct drop-off to your doorstep in " + orig + " with all souvenirs and luggage safely secured.";
            tips = "Notify chauffeur 30 minutes before departure.";
        } else if (m.contains("BIKE")) {
            title = "Return Motorcycle Ride: " + dest + " ➔ " + orig;
            depTime = "03:30 PM";
            arrTime = "08:45 PM";
            duration = "5h 15m";
            cost = 800.0;
            desc = "Sunset return ride back to " + orig + " through cooling twilight breeze.";
            tips = "Ensure motorcycle lights and visor are clean for evening ride.";
        } else {
            title = "Return Journey: " + dest + " ➔ " + orig;
            depTime = "04:00 PM";
            arrTime = "09:30 PM";
            duration = "5h 30m";
            cost = 600.0;
            desc = "Safe return journey from " + dest + " back home to " + orig + ".";
            tips = "Ensure all personal belongings are packed.";
        }

        return new TransitLeg("RETURN", dest, orig, m, title, depTime, arrTime, duration, cost, desc, tips);
    }
}
