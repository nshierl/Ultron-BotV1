const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

var fs = require('fs');
var Promise = require('polyfill-promise');
var Sheets = require('google-sheets-api').Sheets;
var documentId = '1T9DalQHGUat5iU2Mth3T1649EXBVjoHgWAay_6qYY90';
var serviceEmail = 'ultron-bot@live-roster.iam.gserviceaccount.com';
var serviceKey = fs.readFileSync("./src/commands/tools/sheets.pem").toString();
var sheets = new Sheets({ email: serviceEmail, key: serviceKey });

function embedString(string, data){
    for(var i = 0; i<data.length;i++){
    if(data[i].content == ""){
        string = string+"ㅤ\n";
        }else{
            string = string+data[i].content+"\n";
        }
    }
    return string;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roster")
    .setDescription("Display Roster From Google")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    sheets.getSheets(documentId)
.then(function(sheetsInfo) {
  // NOTE: Using third sheet in this!
  var sheetInfo = sheetsInfo[2];
  return Promise.all([
    sheets.getSheet(documentId, sheetInfo.id),
    sheets.getRange(documentId, sheetInfo.id, ""),
  ]);
})
// NOTE: Pulls info from specific cells.
.then(function(sheets) {
    sheetData = sheets[1];
    var cmdr = [sheetData[5][2]];
    var arty = [sheetData[7][3],sheetData[8][3],sheetData[9][3],sheetData[10][3],sheetData[11][3]];
    var recon = [sheetData[14][3],sheetData[16][3]];
    var snipe = [sheetData[20][3]];
    var tank1 = [sheetData[5][6],sheetData[6][6],sheetData[7][6]];
    var tank2 = [sheetData[10][6],sheetData[11][6],sheetData[12][6]];
    var tank3 = [sheetData[15][6],sheetData[16][6]];
    var reconTranspo = [sheetData[19][6],sheetData[20][6]];
    var irn1 = [sheetData[5][9],sheetData[6][9],sheetData[7][9],sheetData[8][9],sheetData[9][9],sheetData[10][9]];
    var thr2 = [sheetData[5][12],sheetData[6][12],sheetData[7][12],sheetData[8][12],sheetData[9][12],sheetData[10][12]];
    var cpt3 = [sheetData[5][15],sheetData[6][15],sheetData[7][15],sheetData[8][15],sheetData[9][15],sheetData[10][15]];
    var ant4 = [sheetData[14][9],sheetData[15][9],sheetData[16][9],sheetData[17][9]];
    var hlk5 = [sheetData[14][12],sheetData[15][12],sheetData[16][12],sheetData[17][12]];
    var aux6 = [sheetData[15][15],sheetData[16][15]];
    var fxt7 = [sheetData[19][15]];
    var prb = [sheetData[19][12],sheetData[20][12]];
//creates the strings from the cells above.
    var cmdrstring = "";
    var artystring = "";
    var reconstring = "";
    var snipestring = "";
    var tank1string = "";
    var tank2string = "";
    var tank3string = "";
    var reconTranspostring = "";
    var irn1string = "";
    var thr2string = "";
    var cpt3string = "";
    var ant4string = "";
    var hlk5string = "";
    var aux6string = "";
    var fxt7string = "";
    var prbstring = "";
//applys strings to named cells.    
    cmdrstring = embedString(cmdrstring, cmdr);
    artystring = embedString(artystring, arty);
    reconstring = embedString(reconstring, recon);
    snipestring = embedString(snipestring, snipe);
    tank1string = embedString(tank1string, tank1);
    tank2string = embedString(tank2string, tank2);
    tank3string = embedString(tank3string, tank3);
    reconTranspostring = embedString(reconTranspostring, reconTranspo);
    irn1string = embedString(irn1string, irn1);
    thr2string = embedString(thr2string, thr2);
    cpt3string = embedString(cpt3string, cpt3);
    ant4string = embedString(ant4string, ant4);
    hlk5string = embedString(hlk5string, hlk5);
    aux6string = embedString(aux6string, aux6);
    fxt7string = embedString(fxt7string, fxt7);
    prbstring = embedString(prbstring, prb);
    

    //console.log(prbstring);
    const rosterEmbed = new EmbedBuilder()
                .setTitle("♿ GOF-ish Match Roster ♿")
                .setDescription("Check if you're playing below:")
                .setColor(0x800080)
                //.setImage("https://cdn.discordapp.com/attachments/936543359974121542/1008366676200411287/GOF.gif")({extension: 'mp4', size: 4096})
                .setFooter({
                  iconURL:
                    "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/907a507d-e421-4e1c-a7f9-a27a30cabd66/df2hcd0-4292b6df-74b3-4eff-a649-3e4b319300c9.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzkwN2E1MDdkLWU0MjEtNGUxYy1hN2Y5LWEyN2EzMGNhYmQ2NlwvZGYyaGNkMC00MjkyYjZkZi03NGIzLTRlZmYtYTY0OS0zZTRiMzE5MzAwYzkucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.9hE9xeqK_NrJDA02KEXxPUatldwFFQakkgpD0rSmIag",
                  text: "Powered by Stark Industries",
                })
                .addFields(
                    {
                      "name": "```CMDR```",
                      "value": cmdrstring,
                      "inline": true
                    },
                                    {
                      "name": "```TANK SIMP```",
                      "value": fxt7string,
                      "inline": true
                    },
                    {
                              "name": "```ARTY SNIPE```",
                      "value": snipestring,
                      "inline": true
                    },
                        {
                      "name": "```TANK 1 [T1]```",
                      "value": tank1string,
                      "inline": true
                    },
                    {
                      "name": "```TANK 2 [T2]```",
                      "value": tank2string,
                      "inline": true
                    },
                    {
                      "name": "```TANK 3 [FXT]```",
                      "value": tank3string,
                      "inline": true
                    },
                        {
                      "name": "```1 | IRONMAN [IRN] 🟡```",
                      "value": irn1string,
                      "inline": true
                    },
                    {
                      "name": "```2 | THOR [THR] 🔵```",
                      "value": thr2string,
                      "inline": true
                    },
                    {
                      "name": "```3 | CPT AMERICA [CPT] 🔴```",
                      "value": cpt3string,
                      "inline": true
                    },
                    {
                      "name": "```4 | ANTMAN [ANT] 🟠```",
                      "value": ant4string,
                      "inline": true
                    },
                        {
                      "name": "```5 | HULK [HLK] 🟢```",
                      "value": hlk5string,
                      "inline": true
                    },
                                    {
                      "name": "```ARTY```",
                      "value": artystring,
                      "inline": true
                    },
                        {
                      "name": "```DEFENCE PROBE [PRB] 🟢```",
                      "value": prbstring,
                      "inline": true
                    },
                    {
                      "name": "```AUXILLERY```",
                      "value": aux6string,
                      "inline": true
                    },
                    {
                      "name": "```RECON```",
                      "value": reconstring,
                      "inline": true
                    },
                            {
                      "name": "```RECON TRANSPORT```",
                      "value": reconTranspostring,
                      "inline": true
                    })
                    return interaction.reply({embeds: [rosterEmbed], ephemeral: false})
})
.catch(function(err){
  console.error(err, 'Failed to read Sheets document');
});
  },
};