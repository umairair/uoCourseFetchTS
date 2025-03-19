import * as cheerio from 'cheerio';

import fetch from 'node-fetch';
import fetchCookie from 'fetch-cookie';

class TimeSlot {
    day: string;
    startTime: string;
    endTime: string;

    constructor(day: string, startTime: string, endTime: string) {
        this.day = day;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    getDay(): string {
        return this.day;
    }

    getStartTime(): string {
        return this.startTime;
    }

    getEndTime(): string {
        return this.endTime;
    }

    toString(): string {
        return `Day: ${this.day}, Start: ${this.startTime}, End: ${this.endTime}`;
    }
}

class Component {
    ID: string;
    type: string;
    timeSlots: TimeSlot[];
    instructors: string[];

    constructor(ID: string, type: string, timeSlots: TimeSlot[], instructors: string[]) {
        this.ID = ID;
        this.type = type;
        this.timeSlots = timeSlots;
        this.instructors = instructors;
    }

    getID(): string {
        return this.ID;
    }

    getType(): string {
        return this.type;
    }

    getTimeSlots(): TimeSlot[] {
        return this.timeSlots;
    }

    getInstructors(): string[] {
        return this.instructors;
    }
}

class Section {
    sectionID: string;
    components: Component[];

    constructor(sectionID: string) {
        this.sectionID = sectionID;
        this.components = [];
    }

    getSectionID(): string {
        return this.sectionID;
    }

    addComponent(component: Component): void {
        this.components.push(component);
    }

    getComponents(): Component[] {
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


async function getCourseHTML(courseCode: string): Promise<string> {
    const subject = courseCode.slice(0, 3);
    const courseNumber = courseCode.slice(3);
    const URL = 'https://uocampus.public.uottawa.ca/psc/csprpr9pub/EMPLOYEE/SA/c/UO_SR_AA_MODS.UO_PUB_CLSSRCH.GBL';
    const fetchWithCookies = fetchCookie(fetch); 

    try {
        // making initial get request to get the ICSID
        const initialResponse = await fetchWithCookies(URL, {
            method: 'GET',
        });
        const initialHtml = await initialResponse.text();

        // preparing data for the post request
        const data: Record<string, string> = {
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
        if(ICSID) {
            data["ICSID"] = ICSID;
           
        }
        else {
            console.error('ICSID not found');
            return "";
        }

        // making post request with the ICSID to get the course html
        const body = new URLSearchParams(data);
        const response = await fetchWithCookies(URL, {
            method: 'POST',
            body: body,
        });
        const courseHtml = await response.text();
        return courseHtml;
    } catch (error) {
        console.error('Error fetching the course data:', error);
        return "";
    }
}

// sectionIdAndComponentTypeElem = soup.find(id="MTG_CLASSNAME$" + str(i))
// timesElem = soup.find(id="MTG_DAYTIME$" + str(i))
// instructorElem = soup.find(id="MTG_INSTR$" + str(i))

function parseHTML(html: string) {
    const $ = cheerio.load(html);
    let hasMoreComponents: boolean = true;
    let i = 0;
   
    while (hasMoreComponents) {
        const component = $('#MTG_CLASSNAME$' + i);
        if(component.length === 0) {
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

async function main(courseCode: string) {
   
    const courseHtml: string = await getCourseHTML(courseCode);
    //console.log(courseHtml);
    parseHTML(courseHtml);
}


main("CSI2110");

