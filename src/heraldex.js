// Heraldex 1.0
// Copyright ©️2024 Roger Skuldwyrm Hågensen

// Usage: Heraldex.create('slideshow_div', 'heraldex.json');
// Options: Heraldex.create('slideshow_div', 'heraldex.json', {refresh: 900, reload: 3600, duration: 300 });
class Heraldex {
  constructor(elementid, dexfile, options = {}) {
    this.refresh =
      options.refresh >= 1 && options.refresh <= 86400 ? options.refresh : 900;
    this.reload =
      options.reload >= 1 && options.reload <= 604800 ? options.reload : 3600;
    this.duration =
      options.duration >= 10 && options.duration <= 3600
        ? options.duration
        : 300;

    this.dexfile = dexfile;
    this.dexid = elementid;
    this.dexlist = [];
    this.nextindex = 0;
    this.lastmodified = null;
    this.tasks = [];
    this.mousehidetimeoutid = null;

    // A little annoying to add these, but with this we avoid arrow functions and temporary functions
    this.schedule_task = this.schedule_task.bind(this);
    this.check_tasks = this.check_tasks.bind(this);
    this.load_dex = this.load_dex.bind(this);
    this.get_dexlist = this.get_dexlist.bind(this);
    this.update_self = this.update_self.bind(this);
    this.init = this.init.bind(this);

    document.addEventListener("DOMContentLoaded", this.init);
  }

  init(event) {
    // Put anything that must have a fully working DOM here
    setInterval(this.check_tasks, 1000);

    this.iframes = document.getElementById(this.dexid);
    if (!this.iframes) {
      throw new Error(`Heraldex: Element with id "${this.dexid}" not found`);
    }
    this.iframes.style.position = "relative";
    this.iframes.style.width = "100%";
    this.iframes.style.height = "100%";

    this.get_dexlist();

    this.schedule_task("get_dexlist", this.refresh, this.get_dexlist);
    this.schedule_task("update_self", this.reload, this.update_self);
  }

  static create(param1, param2, param3) {
    return new this(param1, param2, param3);
  }

  schedule_task(taskid, duration, task) {
    const timescheduled = Date.now() + duration * 1000;
    // If taskid is not empty, check if a task with the same id already exists
    for (let i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i].taskid === taskid) {
        return; // If a task with the same id exists, do not add the new task
      }
    }
    this.tasks.push({ taskid, timescheduled, task });
  }

  check_tasks() {
    const now = Date.now();
    let i = 0;
    while (i < this.tasks.length) {
      if (this.tasks[i].timescheduled > now) {
        // Is it time yet?
        i++;
        continue; // Nope! Skip the execution of the task
      }
      let executetask = this.tasks[i].task;
      this.tasks.splice(i, 1); // Remove task from array first
      executetask(); // Then execute the task
    }
  }

  load_dex() {
    // Prepare the next iframe and transition and swap.
    if (this.dexlist.length < 1) {
      this.schedule_task("load_dex", this.duration, this.load_dex);
      return;
    }
    while (this.iframes.childNodes.length > 1) {
      this.iframes.removeChild(this.iframes.firstChild);
    }
    if (this.iframes.lastChild) {
      this.iframes.lastChild.style.zindex = "0";
    }
    const nextiframe = document.createElement("iframe");
    nextiframe.style.width = "100%";
    nextiframe.style.height = "100%";
    nextiframe.style.position = "absolute";
    nextiframe.style.top = "0px";
    nextiframe.style.border = "none";
    nextiframe.style.transition = "opacity 0.25s linear";
    nextiframe.style.opacity = "0";
    nextiframe.style.zindex = "1";
    nextiframe.src = this.dexlist[this.nextindex].url;
    this.iframes.appendChild(nextiframe);
    nextiframe.onload = () => {
      nextiframe.style.opacity = "1";
    };
    this.schedule_task(
      "load_dex",
      this.dexlist[this.nextindex].duration,
      this.load_dex
    );
    this.nextindex++;
    if (this.nextindex >= this.dexlist.length) {
      this.nextindex = 0;
    }
  }

  get_dexlist() {
    // Load the heraldex.json file
    fetch(this.dexfile)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Heraldex: HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (typeof data !== "object" || data === null) {
          console.error("Heraldex: dex data is not an object");
          return;
        }
        if (
          typeof data.refresh === "number" &&
          data.refresh >= 0 &&
          data.refresh <= 3600
        ) {
          this.refresh = data.refresh;
        }
        if (
          typeof data.reload === "number" &&
          data.reload >= 0 &&
          data.reload <= 86400
        ) {
          this.reload = data.reload;
        }
        if (!data.dex || !Array.isArray(data.dex)) {
          console.error("Heraldex: dex list does not exist or is not an array");
          return;
        }
        let tempdexlist = [];
        data.dex.forEach((entry) => {
          if (typeof entry !== "object" || entry === null) {
            console.error("Heraldex: dex entry is not an object");
            return;
          }
          if (
            typeof entry.url === "string" &&
            typeof entry.duration === "number"
          ) {
            if (entry.duration < 0 || entry.duration > 3600) {
              entry.duration = this.duration;
            }
            tempdexlist.push({
              url: entry.url,
              duration: entry.duration,
            });
          }
        });
        if (tempdexlist.length === 0) {
          console.error("Heraldex: dex list empty or all entries invalid");
          return;
        }
        this.dexlist = tempdexlist;
        this.nextindex = 0;
        this.load_dex();
      })
      .catch((error) => {
        //silently fail
      });
  }

  update_self() {
    // Get the last modified date of the document
    let modified = new Date(document.lastModified);
    if (!isNaN(modified)) {
      this.lastmodified = modified;
    } else {
      console.error("Heraldex: Invalid dcument lastmodified date");
    }

    fetch(location.href, { method: "HEAD" })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Heraldex: HTTP error! status: ${response.status}`);
        }

        const headers = response.headers;
        const lastModified = headers.get("Last-Modified");

        // Check if 'Last-Modified' header exists
        if (lastModified) {
          const updateTime = new Date(lastModified);

          if (this.lastmodified && updateTime > this.lastmodified) {
            // The page has been updated on the server, reload the page
            location.reload();
          } else {
            // Store the update time for the next check
            this.lastmodified = updateTime;
          }
        } else {
          console.error("Heraldex: No Last-Modified header found");
        }
      })
      .catch((error) => {
        console.error(
          "Heraldex: There was a problem with the fetch operation: " +
            error.message
        );
      })
      .finally(() => {
        this.schedule_task("update_self", this.reload, this.update_self);
      });
  }
}
