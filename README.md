# Fossil_Buienradar
App for Fossil Hybrid HR with info from either Dutch KNMI of openmeteo.

## Description
This app is designed for the Fossil Hybrid HR smartwatch. It will not work on any other smartwatch. The app is a stripped and apdated version of my Fossil_Dutch_Weather app.

Dutch KNMI and (international) open meteo both provide local current weather and forecasts. This watchapp relies on Gadgetbridge for the communication with the watch and a 'companion' phone-app that can send information from the internet to gadgetbridge. I used tasker as the companion app. For more info take a look at https://www.buienradar.nl/overbuienradar/gratis-weerdata.


This app shows the current temerature and the weather forecast for today, tomorrow and the day after tomorrow. Upon start of the app the data is requested from Tasker and - when received - shown in the app. The app exits after 30 seconds.

### Installation
Upload forecastApp.wapp to your watch or compile the app yourself. Instructions for preprocessing/compiling the app are similar to those for Gadgetbridge's opensourceWatchface which can be found here: https://codeberg.org/Freeyourgadget/fossil-hr-watchface

four Tasker tasks are included for retrieving and storing information. Two of the task (for retreiving KNMI-data and openmeteo-data) are interchangeable. Use just one of them for downloading and storing weather-data. Both tasks mainly consist of a java scriptlet.
There is also a task for retreiving the current location and city. Import the tasks in Tasker, change them to your needs and create a profile for each to run them at a regular interval. For retreiving NKMI-data you wil need an api-key which you can obtain at weerlive.nl and insert into the http-request in tasker. Search for YOURAPIKEY in the concerning http-requests in Tasker. Search for the frase 'YOURAPIKEY' and replace is with yours. Openmeteo can be used without a key.

A third task contains the dispatcher for catching and processing requests from the watch. Create a profile in Tasker with the event "Intent Received" with the following content: Action: nodomain.freeyourgadget.gadgetbridge.Q_COMMUTE_MENU. Make this profile start a 'dispatcher'-task. An example is included. You may want to catch requests from other apps (as is the case in the example), which you should then also include in this dispatcher (see https://codeberg.org/Freeyourgadget/Gadgetbridge/wiki/Fossil-Hybrid-HR#commute-app ).

## Credits
Many thanks to https://codeberg.org/arjan5 and https://github.com/dakhnod for their insights and help. This app is initially based on their examples and work and in part made with their tools.
