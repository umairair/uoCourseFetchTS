"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = __importStar(require("cheerio"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const fetch_cookie_1 = __importDefault(require("fetch-cookie"));
class TimeSlot {
    constructor(day, startTime, endTime) {
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
    }
    getDay() {
        return this.day;
    }
    getStartTime() {
        return this.startTime;
    }
    getEndTime() {
        return this.endTime;
    }
    toString() {
        return `Day: ${this.day}, Start: ${this.startTime}, End: ${this.endTime}`;
    }
}
class Component {
    constructor(ID, type, timeSlots, instructors) {
        this.ID = ID;
        this.type = type;
        this.timeSlots = timeSlots;
        this.instructors = instructors;
    }
    getID() {
        return this.ID;
    }
    getType() {
        return this.type;
    }
    getTimeSlots() {
        return this.timeSlots;
    }
    getInstructors() {
        return this.instructors;
    }
}
class Section {
    constructor(sectionID) {
        this.sectionID = sectionID;
        this.components = [];
    }
    getSectionID() {
        return this.sectionID;
    }
    addComponent(component) {
        this.components.push(component);
    }
    getComponents() {
        return this.components;
    }
}
// function getSectionID(element: cheerio): string {
//     // Check if element has text content
//     const text = cheerio(element).text().trim();
//     return text[0] || '';
// }
// function getComponentID(element: cheerio.Element): string {
//     const text = cheerio(element).text().trim();
//     return text.slice(0, 3) || '';
// }
// function getComponentType(element: cheerio.Element): string {
//     const text = cheerio(element).text().trim();
//     return text.slice(4, 7) || '';
// }
// function getTimeSlots(element: cheerio.Element): TimeSlot[] {
//     const text = cheerio(element).html()?.replace(/<br\s*\/?>/g, '#');
//     const slots = text?.split('#') || [];
//     const timeSlots: TimeSlot[] = [];
//     for (const entry of slots) {
//         const [day, timeRange] = entry.split(' ', 2);
//         const [startTime, endTime] = timeRange?.split(' - ') || [];
//         if (day && startTime && endTime) {
//             timeSlots.push(new TimeSlot(day.trim(), startTime.trim(), endTime.trim()));
//         }
//     }
//     return timeSlots;
// }
// function getInstructors(element: cheerio.Element): string[] {
//     const text = cheerio(element).html()?.replace(/<br\s*\/?>/g, '#');
//     return Array.from(new Set(text?.split('#') || []));
// }
function getCourseHTML(courseCode) {
    return __awaiter(this, void 0, void 0, function* () {
        const subject = courseCode.slice(0, 3);
        const courseNumber = courseCode.slice(3);
        const URL = 'https://uocampus.public.uottawa.ca/psc/csprpr9pub/EMPLOYEE/SA/c/UO_SR_AA_MODS.UO_PUB_CLSSRCH.GBL';
        const fetchWithCookies = (0, fetch_cookie_1.default)(node_fetch_1.default);
        try {
            // making initial get request to get the ICSID
            const initialResponse = yield fetchWithCookies(URL, {
                method: 'GET',
            });
            const initialHtml = yield initialResponse.text();
            // preparing data for the post request
            const data = {
                "ICAJAX": "1",
                "ICNAVTYPEDROPDOWN": "0",
                "ICType": "Panel",
                "ICElementNum": "0",
                "ICStateNum": "1",
                "ICAction": "CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH",
                "ICSID": "",
                "CLASS_SRCH_WRK2_STRM$35$": "2251",
                "SSR_CLSRCH_WRK_SUBJECT$0": subject.toUpperCase(),
                "SSR_CLSRCH_WRK_SSR_EXACT_MATCH1$0": "E",
                "SSR_CLSRCH_WRK_CATALOG_NBR$0": courseNumber,
                "SSR_CLSRCH_WRK_SSR_OPEN_ONLY$chk$0": "N",
            };
            // getting the ICSID token from the initial html
            const $ = cheerio.load(initialHtml);
            const ICSID = $('input[name=ICSID]').attr('value');
            if (ICSID) {
                data["ICSID"] = ICSID;
            }
            else {
                console.error('ICSID not found');
                return "";
            }
            // making post request with the ICSID to get the course html
            const body = new URLSearchParams(data);
            const response = yield fetchWithCookies(URL, {
                method: 'POST',
                body: body,
            });
            const courseHtml = yield response.text();
            return courseHtml;
        }
        catch (error) {
            console.error('Error fetching the course data:', error);
            return "";
        }
    });
}
// sectionIdAndComponentTypeElem = soup.find(id="MTG_CLASSNAME$" + str(i))
// timesElem = soup.find(id="MTG_DAYTIME$" + str(i))
// instructorElem = soup.find(id="MTG_INSTR$" + str(i))
function parseHTML(html) {
    const $ = cheerio.load(html);
    let hasMoreComponents = true;
    let i = 0;
    console.log(html);
    while (hasMoreComponents) {
        const component = $('#MTG_CLASSNAME$' + i);
        if (component.length === 0) {
            console.log('No more components');
            hasMoreComponents = false;
        }
        else {
            console.log('Component found');
            i++;
            const sectionIdAndComponentTypeElem = $('MTG_CLASSNAME$' + i);
            const timesElem = $('MTG_DAYTIME$' + i);
            const instructorElem = $('MTG_INSTR$' + i);
            console.log(sectionIdAndComponentTypeElem.text());
            console.log(timesElem.text());
            console.log(instructorElem.text());
        }
    }
}
function main(courseCode) {
    return __awaiter(this, void 0, void 0, function* () {
        const courseHtml = yield getCourseHTML(courseCode);
        //console.log(courseHtml);
        parseHTML(courseHtml);
    });
}
main("CSI2110");
