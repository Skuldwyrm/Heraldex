# Heraldex

## About

Heraldex is a dynamic display system that operates on a predefined schedule, from a JSON file, loading and exhibiting slides, referred to as “dex”. These dex are showcased in an iframe and refreshed periodically according to the duration specified in the JSON file.

### Background

The inspiration for Heraldex was to replace a LED wallclock that was cool looking and expensive clock but drifted over time, so why not spend money on a IPS display combined with a Raspberty Pi 4 and show anything I might want instead? The Timedex demo is actually what runs on my wall display daily, I wanted to make something reliable and solid but super flexible. A dynamic display system that can operate on a predefined schedule and load and exhibit slides from a JSON file. Useful in various scenarios such as digital signage, information displays, or even web development for dynamic content presentation. And potentially multiple of them on the same screen with different lists of slides to show on each. It would also have to be very lightweight, no dependencies, work well with other code, be self contained, minimal setup. Self-recovery was important for the robustness, as each dex is in a iframe, should that content break it will be replaced once the duration if over and a new dex is shown, and the list must be refetched often enough for changes to urls, and should the parent page break or have issues it will be reloaded hourly to ensure it has fresh code.

### Potential

Heraldex, being a dynamic display system, can be used in a variety of scenarios. Here are a few potential use cases:

1. Digital Signage: Heraldex can be used to display advertisements, public information, news, and other types of media on digital screens in public spaces like malls, transportation systems, museums, stadiums, retail stores, hotels, restaurants, and corporate buildings.
2. Information Displays: In offices, schools, or community centers, Heraldex can be used to display announcements, schedules, or event information on a rotating basis.
3. Web Development: Web developers can use Heraldex to create dynamic content presentations on websites. For example, a website could use Heraldex to rotate through different pieces of content on the homepage.
4. Exhibitions and Trade Shows: At exhibitions or trade shows, Heraldex can be used to display product information, demos, or promotional content on a loop.
5. Interactive Kiosks: Heraldex can be used in interactive kiosks to display a sequence of screens that guide the user through a process or provide information.

These are just a few examples. The flexible nature of Heraldex allows it to be adapted for many other uses as well. The key is that any scenario where information needs to be displayed dynamically and on a schedule could potentially benefit from using Heraldex.

### heraldex.json

The JSON file comprises a list of URLs and their respective display durations, the “dex” list. Each entry includes a URL and a duration in seconds. For instance, an entry like "url": "bg/bg1.html", "duration": 60 implies that the webpage bg/bg1.html will be displayed for 60 seconds.

### Heraldex class

Heraldex is defined as a class in JavaScript, it is tasked with loading and presenting the dex. It fetches the JSON file containing the array of URLs and display durations. The dex are sequentially pre-loaded into a new iframe, each iframe being displayed for its designated duration before transitioning to the next. The JSON file is re-fetched at regular intervals to check for updates.

### index.html

Heraldex also ensures the parent page remains current by checking the ‘Last-Modified’ header of the current page and reloading the iframe page if server updates are detected.

## Timedex Demo

[Timedex](../examples/Timedex/) is a practical illustration of how to implement the Heraldex system. The Timedex page’s HTML includes a digital clock, a dex-displaying iframe, and a date display. The page is styled with a black background and red text via CSS, and a custom font is used for the digital display.

Timedex also defines a digital clock function that updates the time and date every second, starting when the page loads and continuing every second thereafter.

### Hiding the mouse cursor

The example index.html also provide a mouse cursor hiding feature, suitable for information displays. In the demo a element cover the entire screen and has the highest z-index, the cursor is hidden as part of the loaded page css. Note that anything that unhide the mouse pointer may cause the pointer to be left on screen even if code is used to hide it again. This way is the only way currently to consistently hide the cursor, doing it using javascript after or even during page load and checking if the mouse pointer is idle does not always work, parent page reload, or the user having recently moved the mouse (maybe due to having to adjust things in the kiosk/info display) then the mouse cursor may not be automatically hidden and require the user to move the mouse at least one pixel. If this issue is improved in future browser versions then a mouse hide feature may get intergrated into the Heraldex class. There is also no automatic fullscreen for similar reasons as code triggerd fullscreen andf "F11" aka user fullscreen are not the same. There are phishing prevention meassures in modern browsers.
If you do not like this way of dointg it by permanently hiding the mouse pointer then do not use the code in the demo, instead use either browser kiosk settings or OS settings for automatic mouse hiding on idle, these should work on the entire screen/browser window instead of just the document/page.

## Installation

1. Clone the repository to your local machine.
2. Due to CORS restrictions, the Timedex demo needs to be run on a web server. You can set up a simple local web server using Python or Node.js.

## Usage

To incorporate the Heraldex system into any webpage, create a new instance of the Heraldex class and pass the id of an iframe element.

```javascript
let heraldex = new Heraldex("slides", "timedex.json");
```

Or if you have no need for a reference to the class (there are currently no utility functions to call) then you can just do the slightly simpler way:

```javascript
Heraldex.create("slideshow_div", "heraldex.json");
```

## Options

You can customize Heraldex by providing options when you create a new instance. These options allow you to set different default values:

```javascript
let heraldex = new Heraldex("slideshow_div", "heraldex.json", {
  refresh: 900, // How often the heraldex.json file should be reloaded (in seconds)
  reload: 3600, // How often the main page will be checked for modifications (in seconds)
  duration: 300, // Default display time for a dex if it doesn't have one set or the value is out of range (in seconds)
});
```

Or, if you don’t need to refer to the class later, you can do it this way:

```javascript
Heraldex.create("slideshow_div", "heraldex.json", {
  refresh: 900, // How often the heraldex.json file should be reloaded (in seconds)
  reload: 3600, // How often the main page will be checked for modifications (in seconds)
  duration: 300, // Default display time for a dex if it doesn't have one set or the value is out of range (in seconds)
});
```

By default, Heraldex checks for modifications to the main page every hour (3600 seconds), reloads the json file every 15 minutes (900 seconds), and displays a dex for 5 minutes (300 seconds) if it doesn’t have a valid duration. If you’re okay with these defaults, you don’t need to set these options. You can also set just one or two of them, and in whatever order you prefer. All these time options are specified in seconds.

## License

Heraldex is licensed under [MIT](license).
