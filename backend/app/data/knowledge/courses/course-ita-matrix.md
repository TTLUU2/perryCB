---
title: "ITA Matrix"
category: redemptions
programs: [qantas]
intents: [LEARNING]
source: "Course 08: Cheap Airfares &amp; Round-the-World Tickets"
module: "Find Cheap Flights"
---

# ITA Matrix

**ITA Matrix**

Learn how to make the most of ITA Matrix, one of the most powerful flight search tools on the internet.

In this training unit, we will cover…

## Introduction to ITA Matrix

In the previous training unit, we introduced ITA Matrix. This powerful flight search engine is capable of finding the cheapest flights for almost any routing - from simple one-way flight searches, right through to complex multi-city itineraries. So it's worth spending a bit of time getting to know how to use the ITA Matrix website properly!

## Video demonstration: How to use ITA Matrix

This video demonstration explains how to use the main features of ITA Matrix:

https://www.youtube.com/watch?v=H1vmyAvAEgM

Please note, there have been some changes to ITA Matrix since this video was recorded:

- "Advanced routing codes" are now called "Routing Codes"

- Extension Codes are now input into a separate box and it is no longer necessary to add a forward-slash before entering an extension code.

To bring up these and other additional options, click on "Add Advanced Controls":

Click "Add Advanced Controls" to add additional filters/criteria to your search in the new version of ITA Matrix.

## Advanced controls

ITA Matrix has many useful features. But what *really *makes it a powerful search engine are its Advanced Controls. These can be used to filter your search, making it easier than ever to find *exactly* the flight/s you're looking for. You can even tell it what *not *to look for.

ITA Matrix screenshot.

When using the ITA Matrix website, you'll find a small "**?**" icon to the right of each Advanced Controls input box. Hover your mouse over this icon to see a list of some of the Advanced Controls and Extension Codes available and some examples of how to use them. To make it easier for you, we've also added a list of some of the main codes below.

Advanced Routing Codes can be used to filter any ITA Matrix search. You can specify just about anything, including:

- Which airline/s to look for

- The number of stopovers, or a specific stopover airport

- Exclude overnight flights

- Include or exclude specific flights

- Exclude flights on turboprop/propeller aircraft

- Specify that you want a certain number of flights on a particular airline (useful for status runs)

- Specify a minimum connection time

- Any combination of the above, and more!

## Routing Codes

Here is a **list of key ITA Matrix Routing Codes**:

FunctionCodeExampleOptional prefix for "marketing carrier"
**This is the default option for airline codes – no prefix necessary*

C:C:QFPrefix for "operating carrier"O:O:QFPrefix for "non-stop flight"N:N:QFPrefix for "direct flight"
*(Direct flights may include flights with stops, where the flight number doesn't change, e.g. QF1 SYD-LHR which stops in SIN.)*

F:F:QFOptional prefix for "stopover airport"
**This is the default option for airport codes – no prefix necessary*

X:X:LAXSuffix for "either zero or one"
*(Priority will be given to an option with a question mark, but other routings/airlines will also be considered.)*

?X:SYD?
*(This would mean that the itinerary may or may not have a stop in Sydney)*

Suffix for "one or more flights"+QF+Suffix for "zero or more flights"*QF*Prefix for making something negative~~JQ
*(This would mean “Exactly 1 flight that is NOT a Jetstar flight”)*

And here are some **examples of how to use these Routing Codes**:

Putting this into practiceCodeExampleDirect flight on one of a selection of specific marketing airlines
**Ensure there are no spaces, or it will assume you want separate flights.*

C:XX,XX,XXC:QF,VA,NZDirect flight on one of a selection of specific operating carriersO:XX,O:XX,O:XXO:EK,O:LA,O:NZDirect flight, NOT on a specific airlineO:~XXO:~QFExactly 1 stop (any airport)XXExactly 1 stop in a specific airportX:YYYX:DXBExactly 1 stop in one of a selection of specific airportsX:YYY,YYY,YYYX:HNL,SFO,DFWExactly 2 stops, with the first stop in a specific airportYYY XDXB XExactly 2 stops, both in specific airportsYYY YYYDXB LHRExactly 3 sectors on a specific airlineXX XX XXAA AA AAEither a direct or 1 stop flightX?X?Either a direct flight or a flight with a stop at a specific airportYYY?SYD?Specific flight numberF:XX00F:QF15Any flights except a specific flightF:~XX00F:~JQ171

And here are some **more advanced searches** that you can do:

Putting this into practiceCodeExampleOne or more flights on a specific airline, followed by one or more flights on another specific airlineXX+ ZZ+QF+ BA+One or more flights on a specific airline, followed by a stop in a particular airport, followed by one or more flights on any except one specific airline.
**To specify an airline & an airport, the first airline code should come before the first airport code.*

XX+ YYY ~ZZ+QF+ LAX ~AA+A specific flight followed by any single flightXX00 FQF28 FTwo flights on a particular airline, with a connection in a specific airportXX YYY XXQF MEL QFThree flights; the first on a specific carrier, followed by a stopover at a particular airport. The second flight on one of two carriers, followed by a stop at any airport. The third flight must be non-stop but can be on any airline.XX YYY XX,ZZ X NQF DXB QF,EK X NA flight on a specific airline within a specific flight number rangeXX00-00QF1-1399

## Extension Codes

Here is a list of ITA Matrix **Extension Codes** and how to use them…

FunctionCodeExample**Specify connection times**:  Minimum connection time (minutes)minconnect 00minconnect 90Maximum connection time (minutes)maxconnect 000maxconnect 240Pad out the connection time (minutes)
- this will add extra minimum connection time on top of what is normally allowed)

padconnect 00padconnect 30Maximum total trip duration (minutes)maxdur 000maxdur 600**Search by airline alliance**:  **one**world flights onlyalliance oneworldalliance oneworldStar Alliance flights onlyalliance star-alliancealliance star-allianceSkyTeam flights onlyalliance skyteamalliance skyteam**Search for specific fare classes**:  Search by fare class (single letter fare class code, e.g. N, Y, D, A etc.)f bc=xf bc=dSearch for flights in multiple fare classes
**Separate with “*|*”; no spaces.*

f bc=x|bc=x|bc=xf bc=y|bc=b|bc=h**Remove undesirable options**:No overnight layovers-overnight-overnightNo redeye (overnight) flights-redeye-redeyeNo airport changes-change-changeNo codeshare flights-codeshare-codeshareNo propeller/turboprop aircraft-prop-propNo flights WITHOUT a First class cabin-nofirstclass-nofirstclassNo train connections (for rare instances where trains with flight number codeshares are offered)-train-train

## Fare breakdown and rules

Another handy feature of ITA Matrix is that you can easily view the fare breakdown and fare rules for any ticket.

## Fare breakdown

Once you've selected your flights, you'll see a summary of the itinerary and a price. If you then scroll down, you'll see a complete fare breakdown. This is useful for travel agents, but it also allows you to see the different components of the airfare, including how much is being charged in taxes and airline fuel surcharges.

Example of a fare breakdown on ITA Matrix.

The amount of taxes and fuel surcharges payable on revenue bookings is often the same or similar to the amount paid on award bookings. So this feature can also be useful for estimating the taxes you would need to pay on an award booking. There are some cases though where surcharges are only applied to award bookings, such as Qantas' so-called carrier charges.

## Fare rules

In the breakdown, there is a link to the fare rules next to each fare being quoted. Click on this link to bring up the full fare rules.

Example of fare rules shown on ITA Matrix.

The fare rules contain lots of useful information, including:

- Minimum/maximum stay

- Whether stopovers are allowed

- Fare expiry date

- Fare class

- Advanced ticketing restrictions

- Booking change and cancellation fees

## How to book flights found on ITA Matrix

The main downside with ITA Matrix is that you can't book directly through this website.

Once you've found a flight you're happy with, you can book directly with the airline. But sometimes the price shown on the airline's website will be higher than what's shown on ITA Matrix. So, what should you do if this happens?

Some things you could try include:

- Go to a travel agent

- Try searching for the same flights on Google Flights

- Use the "Book With Matrix" website

## Book With Matrix

Book With Matrix home page.

Using Book With Matrix is pretty easy. All you have to do is highlight and copy the ITA Matrix results page. Then, simply paste this content into the box on the Book With Matrix website.

Your itinerary will then be automatically reconstructed before your eyes, and you'll be able to complete the booking through a partner online travel agent such as OneTravel or Priceline. If your booking is with an American airline, you'll also be given the option to complete the booking directly on that airline's website. This could be especially useful for booking American Airlines status runs.

The main disadvantage of Book With Matrix is that it will always price your booking in US Dollars. Unless you're booking a flight departing from the USA, this may not necessarily work in your favour.
