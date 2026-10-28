# Chapter 17: Spreadsheet & Sector Tracker Reference

> **Source:** Vindicator Star Kingdoms Spreadsheet (v1.05, 2003–2004)  
> **Original URL:** `http://www.angelfire.com/ill/l33t_hacker/Vindicator/18_sheet.html`

The Vindicator Spreadsheet was a utility designed to parse pasted in-game sector lists, compare historical snapshots, identify inactive "banks" (accumulating money with zero military activity), and detect sudden drops in land or Net Worth (signaling active hits).

## Key Features
- **Delta Tracking:** Compares Land and Net Worth changes over time intervals ($T_1 	o T_2$).
- **Bank Detection Algorithm:** Filters kingdoms with high positive resource accumulation, zero military building changes, and stable low Land.
- **Overkill Protection:** Identifies kingdoms that recently suffered land loss to prevent hitting targets during the diminishing-returns cooldown.

---

## Preserved JavaScript Implementation (2004)

```javascript
//Star Kingdoms Spreadsheet. By: Vindicator. version 1.05. 2003-04-09, 2003-04-10, 2003-04-29, 2003-12-02, 2004-01-21 &copy;&reg;&#8482;

//1.01 update, 2003-04-09
//If people want specific characters between different values to make it easier to distinguish them,
//they can enter that in the Textbox for -Space characters-. If they enter -_____- the kingdom data will
// be shown like -kingdom _____ nw _____ land- in the comparisons.

//1.02 update, 2003-04-10
//added reset buttons and bank setting button. Updated help.

//1.03 update, 2003-04-29
//Updated the help file, changed max NW*change for auto bank settings to 500.

//1.04 Update, 2003-12-02
// New design, time between probings added, in case people using this spreadsheet wait longer than 1 hour between comparsions.
// Help rewritten.

//1.05 Update.
//Removed unnecessary things, like the spaces between values.
//Added a help which is a lot more detailed, for those who need it.
//Added possibility to save up to 20 sectors with a comment. I didn't enable cookies, so it's just for as long as the window is open.
//added tab things in the results so that values are shown in nice columns and are easier to read.

//global variables
var xxminland
var xxmaxland
var xxminnw
var xxmaxnw
var xxmaxlandchange
var xxminlandchange
var xxminnwchange
var xxmaxnwchange
var xxmaxlandchangepercent
var xxminlandchangepercent
var xxmaxnwchangepercent
var xxminnwchangepercent
var charbetween
var timebetween

//variables for saving sectors and comments about them in the list
var s1sector = ""
var s2sector = ""
var s3sector = ""
var s4sector = ""
var s5sector = ""
var s6sector = ""
var s7sector = ""
var s8sector = ""
var s9sector = ""
var s10sector = ""
var s11sector = ""
var s12sector = ""
var s13sector = ""
var s14sector = ""
var s15sector = ""
var s16sector = ""
var s17sector = ""
var s18sector = ""
var s19sector = ""
var s20sector = ""

var s1comment = ""
var s2comment = ""
var s3comment = ""
var s4comment = ""
var s5comment = ""
var s6comment = ""
var s7comment = ""
var s8comment = ""
var s9comment = ""
var s10comment = ""
var s11comment = ""
var s12comment = ""
var s13comment = ""
var s14comment = ""
var s15comment = ""
var s16comment = ""
var s17comment = ""
var s18comment = ""
var s19comment = ""
var s20comment = ""

//saves a sector in the list
function saveInList() {
if (document.form1.sectorsave.value == 1) { s1comment = document.form1.commentfield.value ; s1sector = document.form1.oldstats.value}
if (document.form1.sectorsave.value == 2) { s2comment = document.form1.commentfield.value ; s2sector = document.form1.oldstats.value}
if (document.form1.sectorsave.value == 3) { s3comment = document.form1.commentfield.value ; s3sector = document.form1.oldstats.value}
if (document.form1.sectorsave.value == 4) { s4comment = document.form1.commentfield.value ; s4sector = document.form1.oldstats.value}
if (document.form1.sectorsave.value == 5) { s5comment = document.form1.commentfield.value ; s5sector = document.form1.oldstats.value}
if (document.form1.sectorsave.value == 6) { s6comment = document.form1.commentfield.value ; s6sector = document.form1.oldstats.value}
if (document.form1.sectorsave.value == 7) { s7comment = document.form1.commentfield.value ; s7sector = document.form1.oldstats.value}
if (document.form1.sectorsave.value == 8) { s8comment = document.form1.commentfield.value ; s8sector = document.form1.oldstats.value}
if (document.form1.sectorsave.value == 9) { s9comment = document.form1.commentfield.value ; s9sector = document.form1.oldstats.value}
if (document.form1.sectorsave.value == 10) { s10comment = document.form1.commentfield.value ; s10sector = document.form1.oldstats.value}
if (document.form1.sectorsave.value == 11) { s11comment = document.form1.commentfield.value ; s11sector = document.form1.oldstats.value}
if (document.form1.sectorsave.value == 12) { s12comment = document.form1.commentfield.value ; s12sector = document.form1.oldstats.value}
if (document.form1.sectorsave.value == 13) { s13comment = document.form1.commentfield.value ; s13sector = document.form1.oldstats.value}
if (document.form1.sectorsave.value == 14) { s14comment = document.form1.commentfield.value ; s14sector = document.form1.oldstats.value}
if (document.form1.sectorsave.value == 15) { s15comment = document.form1.commentfield.value ; s15sector = document.form1.oldstats.value}
if (document.form1.sectorsave.value == 16) { s16comment = document.form1.commentfield.value ; s16sector = document.form1.oldstats.value}
if (document.form1.sectorsave.value == 17) { s17comment = document.form1.commentfield.value ; s17sector = document.form1.oldstats.value}
if (document.form1.sectorsave.value == 18) { s18comment = document.form1.commentfield.value ; s18sector = document.form1.oldstats.value}
if (document.form1.sectorsave.value == 19) { s19comment = document.form1.commentfield.value ; s19sector = document.form1.oldstats.value}
if (document.form1.sectorsave.value == 20) { s20comment = document.form1.commentfield.value ; s20sector = document.form1.oldstats.value}
document.form1.oldstats.value = "Saved old stats as sector no. " + document.form1.sectorsave.value + "."
return
}

//loads a sector from the list
function getFromList(){
if (document.form1.sectorsave.value == 1) {document.form1.commentfield.value = s1comment ; document.form1.oldstats.value = s1sector}
if (document.form1.sectorsave.value == 2) {document.form1.commentfield.value = s2comment ; document.form1.oldstats.value = s2sector}
if (document.form1.sectorsave.value == 3) {document.form1.commentfield.value = s3comment ; document.form1.oldstats.value = s3sector}
if (document.form1.sectorsave.value == 4) {document.form1.commentfield.value = s4comment ; document.form1.oldstats.value = s4sector}
if (document.form1.sectorsave.value == 5) {document.form1.commentfield.value = s5comment ; document.form1.oldstats.value = s5sector}
if (document.form1.sectorsave.value == 6) {document.form1.commentfield.value = s6comment ; document.form1.oldstats.value = s6sector}
if (document.form1.sectorsave.value == 7) {document.form1.commentfield.value = s7comment ; document.form1.oldstats.value = s7sector}
if (document.form1.sectorsave.value == 8) {document.form1.commentfield.value = s8comment ; document.form1.oldstats.value = s8sector}
if (document.form1.sectorsave.value == 9) {document.form1.commentfield.value = s9comment ; document.form1.oldstats.value = s9sector}
if (document.form1.sectorsave.value == 10) {document.form1.commentfield.value = s10comment ; document.form1.oldstats.value = s10sector}
if (document.form1.sectorsave.value == 11) {document.form1.commentfield.value = s11comment ; document.form1.oldstats.value = s11sector}
if (document.form1.sectorsave.value == 12) {document.form1.commentfield.value = s12comment ; document.form1.oldstats.value = s12sector}
if (document.form1.sectorsave.value == 13) {document.form1.commentfield.value = s13comment ; document.form1.oldstats.value = s13sector}
if (document.form1.sectorsave.value == 14) {document.form1.commentfield.value = s14comment ; document.form1.oldstats.value = s14sector}
if (document.form1.sectorsave.value == 15) {document.form1.commentfield.value = s15comment ; document.form1.oldstats.value = s15sector}
if (document.form1.sectorsave.value == 16) {document.form1.commentfield.value = s16comment ; document.form1.oldstats.value = s16sector}
if (document.form1.sectorsave.value == 17) {document.form1.commentfield.value = s17comment ; document.form1.oldstats.value = s17sector}
if (document.form1.sectorsave.value == 18) {document.form1.commentfield.value = s18comment ; document.form1.oldstats.value = s18sector}
if (document.form1.sectorsave.value == 19) {document.form1.commentfield.value = s19comment ; document.form1.oldstats.value = s19sector}
if (document.form1.sectorsave.value == 20) {document.form1.commentfield.value = s20comment ; document.form1.oldstats.value = s20sector}
return
}

//gets new stats from the input box.
function getStats(){
if ((document.form1.getstatsfield.value != "") && (document.form1.getstatsfield.value != "---New stats saved---")
&& (document.form1.getstatsfield.value != "---Old stats saved---") &&
(document.form1.getstatsfield.value !="---Copy a sectorlist and paste it here---")){

document.form1.resultfield.value = ("$" + removeStuff(document.form1.getstatsfield.value))
document.form1.getstatsfield.value = "---New stats saved---"
}
}

//gets old stats from the input box.
function saveStats(){
if ((document.form1.getstatsfield.value != "") && (document.form1.getstatsfield.value != "---New stats saved---")
&& (document.form1.getstatsfield.value != "---Old stats saved---") &&
(document.form1.getstatsfield.value !="---Copy a sectorlist and paste it here---")){
document.form1.oldstats.value = ("$" + removeStuff(document.form1.getstatsfield.value))
document.form1.getstatsfield.value = "---Old stats saved---"
}
}

//reset the box where the old stats are saved.
function resetold(){
document.form1.oldstats.value = ""
}

//reset the box where the new stats are saved.
function resetnew(){
document.form1.resultfield.value = ""
}

//clear the input box.
function clearBox(){
if (document.form1.getstatsfield.value == "---New stats saved---") {document.form1.getstatsfield.value = ""}
if (document.form1.getstatsfield.value == "---Old stats saved---") {document.form1.getstatsfield.value = ""}
if (document.form1.getstatsfield.value == "---Copy a sectorlist and paste it here---")
{document.form1.getstatsfield.value = ""}
}

//Main function. compares two stats, gets different values, filters specific kingdoms.
function compareStats() {
var temp = String(document.form1.resultfield.value)
var tempb = String(document.form1.oldstats.value)
if (tempb == "") {return ""}
if (temp == "") {return ""}
timebetween = parseInt(document.form1.timebetween.value)

xxminland = -999999
xxmaxland = 999999
xxminnw  = -99999999
xxmaxnw = 999999999
xxmaxlandchange = 999999
xxminlandchange  = -999999
xxminnwchange  = -999999
xxmaxnwchange = 999999
xxmaxlandchangepercent = 999999
xxminlandchangepercent  = -999999
xxmaxnwchangepercent = 999999
xxminnwchangepercent  = -999999
if (document.form1.miniland.value != "") {xxminland = document.form1.miniland.value}
if (document.form1.maxiland.value != "") {xxmaxland = document.form1.maxiland.value}
if (document.form1.mininw.value != "") {xxminnw = document.form1.mininw.value}
if (document.form1.maxinw.value != "") {xxmaxnw = document.form1.maxinw.value}

if (document.form1.minilandchange.value != "") {xxminlandchange = document.form1.minilandchange.value}
if (document.form1.maxilandchange.value != "") {xxmaxlandchange = document.form1.maxilandchange.value}
if (document.form1.mininwchange.value != "") {xxminnwchange = document.form1.mininwchange.value}
if (document.form1.maxinwchange.value != "") {xxmaxnwchange = document.form1.maxinwchange.value}

if (document.form1.minilandpercentchange.value != "") {xxminlandchangepercent = document.form1.minilandpercentchange.value}
if (document.form1.maxilandpercentchange.value != "") {xxmaxlandchangepercent = document.form1.maxilandpercentchange.value}
if (document.form1.mininwpercentchange.value != "") {xxminnwchangepercent = document.form1.mininwpercentchange.value}
if (document.form1.maxinwpercentchange.value != "") {xxmaxnwchangepercent = document.form1.maxinwpercentchange.value}

document.form1.getstatsfield.value = "Kingdom name"
if (document.form1.showNw.checked == true) {
document.form1.getstatsfield.value = (document.form1.getstatsfield.value + "\tNW ")}
if (document.form1.showNwChange.checked == true) {
document.form1.getstatsfield.value = (document.form1.getstatsfield.value + "\tNW+ ")}
if (document.form1.showNwPercentChange.checked == true) {
document.form1.getstatsfield.value = (document.form1.getstatsfield.value + "\tNW%+ ")}
if (document.form1.showLand.checked == true) {
document.form1.getstatsfield.value = (document.form1.getstatsfield.value + "\tLand ")}
if (document.form1.showLandChange.checked == true) {
document.form1.getstatsfield.value = (document.form1.getstatsfield.value + "\tLand+ ")}
if (document.form1.showLandPercentChange.checked == true) {
document.form1.getstatsfield.value = (document.form1.getstatsfield.value + "\tLand%+ ")}
document.form1.getstatsfield.value = (document.form1.getstatsfield.value + "")
compare (temp, tempb)
}

//sets the settings to find banks.
function bankreset () {
document.form1.showLandPercentChange.checked = false
document.form1.showLandChange.checked = false
document.form1.showLand.checked = false
document.form1.showNwPercentChange.checked = true
document.form1.showNwChange.checked = true
document.form1.showNw.checked = true

document.form1.miniland.value = 500
document.form1.minilandchange.value = 0
document.form1.minilandpercentchange.value = ""

document.form1.maxiland.value = ""
document.form1.maxilandchange.value = 0
document.form1.maxilandpercentchange.value = ""

document.form1.mininw.value = ""
document.form1.mininwchange.value = 0
document.form1.mininwpercentchange.value = 1

document.form1.maxinw.value = ""
document.form1.maxinwchange.value = ""
document.form1.maxinwpercentchange.value = 400
}

//selects different kingdom parts from the text files saved.
function compare(temp, tempb) {
if ((tempb == "$" )|| (temp == "$")) {return ""}
if ((tempb == " " )|| (temp == " ")) {return ""}
var pos1 = (tempb.indexOf("#"))
var name = tempb.substring((tempb.indexOf("$") + 1) , pos1)
tempb = tempb.substring(pos1 + 2, tempb.length)
var oldland = Number(tempb.substring(0,tempb.indexOf(" ")))
tempb = tempb.substring(tempb.indexOf(" ") + 1, tempb.length)
var oldnw = Number(tempb.substring(0,tempb.indexOf(" ")))
tempb = tempb.substring(tempb.indexOf(" ") + 1, tempb.length)

var pos2 = (temp.indexOf("#"))
var newname = temp.substring((temp.indexOf("$") + 1) , pos2)
temp = temp.substring(pos2 + 2, temp.length)
var newland = Number(temp.substring(0,temp.indexOf(" ")))
temp = temp.substring(temp.indexOf(" ") + 1, temp.length)
var newnw = Number(temp.substring(0,temp.indexOf(" ")))
temp = temp.substring(temp.indexOf(" ") + 1, temp.length)

var nwchange = (parseInt(newnw - oldnw))
var landchange = (parseInt(newland - oldland))

if (name != "None") {if (xxminland < newland)
 {if (xxmaxland >= newland) {if
(xxminnw < newnw) {if (xxmaxnw >= newnw) {if (xxminlandchange <= landchange) {if
(xxmaxlandchange >= landchange) {if (xxminnwchange <= nwchange) {if
(xxmaxnwchange >= nwchange)  {

var nwpercentchange = 0
if (oldnw != 0) {nwpercentchange = parseInt((((newnw - oldnw) / (oldnw/100)) * 2000) / timebetween)}
var landpercentchange = 0
if (oldland != 0) {landpercentchange = parseInt((((newland - oldland) / (oldland/100)) * 100) / timebetween)}

if (xxminlandchangepercent <= landpercentchange) {if
(xxmaxlandchangepercent >= landpercentchange) {if (xxminnwchangepercent <= nwpercentchange) {if
(xxmaxnwchangepercent >= nwpercentchange) {

if (document.form1.showNw.checked == false) {newnw = ""}
if (document.form1.showLand.checked == false) {newland = ""}

if (newland != "") {newland = ("" + newland) }
if (newnw != "") {newnw = ("" + newnw ) }
if (landchange != "") {landchange = ("" + landchange ) }
if (nwchange != "") {nwchange = ("" + nwchange ) }

if (newland < 0) {newland = ("\t" + newland) }
if (newnw < 0) {newnw = ("\t" + newnw ) }
if (landchange < 0) {landchange = ("\t" + landchange ) }
if (nwchange < 0) {nwchange = ("\t" + nwchange ) }

if (landchange >= 0) {landchange = ("\t+" + landchange) }
if (nwchange >= 0) {nwchange = ("\t+" + nwchange) }
if (landpercentchange >= 0) {landpercentchange = ("\t+" + landpercentchange) }
if (nwpercentchange >= 0) {nwpercentchange = ("\t+" + nwpercentchange) }

if (document.form1.showLandChange.checked == false) {landchange = ""}
if (document.form1.showNwChange.checked == false) {nwchange = ""}
if (document.form1.showNwPercentChange.checked == false) {nwpercentchange = ""}
if (document.form1.showLandPercentChange.checked == false) {landpercentchange = ""}

var namelength = name.length
while (namelength < 18) {
name = (name + " ")
namelength = namelength + 1
}

document.form1.getstatsfield.value = (document.form1.getstatsfield.value + "\n" + name + newnw +
nwchange + nwpercentchange + "\t" + newland +  landchange + landpercentchange)
}
}

}}}}}}}}}}}

compare(temp,tempb)
}

//removes unnecessary stuff (like planet types and coordinates)
function removeStuff(data) {
var data = data.replace(/,/g,"")
.replace(/Kingdom Name (Sector Coords)/g,"")
.replace(/Planet Type Land Networth Tactical/g,"")
.replace(/Planet Type Land Networth/g,"")
.replace(/Return Tactical/g,"")
.replace(/Tactical/g,"")
.replace(/Kingdom Name /g,"")
.replace(/\r/g,"").replace(/\n/g,"$ ")
.replace(/Mystical Lands/g,"")
.replace(/Multiple Terrain/g,"").replace(/Forest and Wilderness/g,"")
.replace(/Oceanic/g,"").replace(/Terra Form/g,"")
.replace(/Volcanic Inferno/g,"").replace(/Mountainous/g,"")
.replace(/Desert Wasteland/g,"")
.replace(/11h/g,"")
.replace(/12h/g,"")
.replace(/13h/g,"")
.replace(/14h/g,"")
.replace(/15h/g,"")
.replace(/16h/g,"")
.replace(/17h/g,"")
.replace(/18h/g,"")
.replace(/19h/g,"")
.replace(/20h/g,"")
.replace(/21h/g,"")
.replace(/22h/g,"")
.replace(/23h/g,"")
.replace(/24h/g,"")
.replace(/25h/g,"")
.replace(/26h/g,"")
.replace(/27h/g,"")
.replace(/28h/g,"")
.replace(/29h/g,"")
.replace(/30h/g,"")
.replace(/1h/g,"")
.replace(/2h/g,"")
.replace(/3h/g,"")
.replace(/4h/g,"")
.replace(/5h/g,"")
.replace(/6h/g,"")
.replace(/7h/g,"")
.replace(/8h/g,"")
.replace(/9h/g,"")
.replace(/10h/g,"")
.replace(/   /g," ")
.replace(/  /g," ")
.replace(/Open Open Open Open Open Open/g,"None () 0 0") //if scouter is researched
.replace(/Open Open Open Open Open/g,"None () 0 0")
.replace(/@/g,"")
.replace(/DEAD DEAD DEAD DEAD DEAD/g,"0 0") //if scouter is researched
.replace(/DEAD DEAD DEAD DEAD/g,"0 0")
.replace(/Reserved Reserved Reserved Reserved Reserved Reserved/g,"None () 0 0") //if scouter is researched
.replace(/Reserved Reserved Reserved Reserved Reserved/g,"None () 0 0")
.replace(/$/g,"$ ")
.replace(/  /g," ")
data = (data + " $")
//data = data.substring(4 , data.length)
data = removeCoords(data)
data.replace(/$ # /g,"")

return data
}

//removes stupid coords and adds some other symbols instead.
function removeCoords(data) {
if ((data == "$") || (data.indexOf("(") == -1)) {return ""}
var f = data.substring(0,(data.indexOf("(") - 1))
var g = f + " #" + data.substring((data.indexOf(")") +1) , (data.indexOf("$") +1))
var h = String(g + removeCoords(data.substring((data.indexOf("$") +2) , data.length)))

return (h)
} 

//displays helpbox.
function showHelp(){
alert("Vindicator SK spreadsheet. By Vindicator. 2004-01-20\n\n" +
"This is a spreadsheet for finding banks or good targets in Star Kingdoms. To use it, "+
"you first of all copy one sector at the time to the big textfield, and press -Get Old-."+
"The sector info will be converted to kingdom stats text, which you can copy from the old stats field "+
"to a text editor and save. Don't forget to also take notes about which sectors it is "+
"then wait at least one hour, to make sure that both the hour has changed and the sector data " +
"has been updated. If you wait several hours, don't forget to set the field next to " +
"help - Time between stats - to the correct number.\n\n"+

"After that, copy one sector from the text editor to the old stats field, then go to the same sector in SK, "+
"and get the recent kingdom info of it, which you paste into the big textbox. Then click on -Get New-.\n\n"+
"If you have done this correct, both the two fields to the right should be filled with kingdom stats text. "+
"The first row of settings in the field below the big text area is what you should compare (or list in the "+
"comparison). You can list kingdom names, NW, land, NW change (Named NW+), Land change (Land+), Land%+ " +
"and NW%+. The last two are comparisons of how much kigndoms have grown in NW and land compared to "+
"their own size, because big kingdoms usually grow much faster than smaller ones.\n"+
"You can also chose if you want to remove kingdoms below or above specific values by entering that "+
"on the rows below. If you want to make a comparison for a to landgrab, you are probably not interested "+
"in kingdoms which have gained 0 land, for example, and can therefore set Min land change to 1.\n"+
"For automatic bank-finding settings, just click on -Banks- at the top.\n\n"+

"After this, you click on the -Compare- button to compare stats. The kingdom comparisons will appear in "+
"the window which you pasted data to before (input/output window).  Someone with a NW*change "+
"of between 100 and 250 is usually inactive and a good bank, 250-500 is a possible bank, while people "+
"with more than that definately aren't, unless they have a really high income.")
}
```
