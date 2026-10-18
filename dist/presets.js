export const BUILTIN_PRESET_NAMES=Object.freeze({nutrition:'Nutrition plan',route:'Route notes',custom:'Custom',flanders:'Tour of Flanders'});
// Project-owner templates. Edit these entries to publish your own starting plans.
// These illustrative cues are not personalised nutrition advice.
// Each entry: [distance in km, bundled icon key, cue text].
export const BUILTIN_CUES = {
  nutrition: [[20,'banana','Banana'],[40,'bottle','Drink'],[60,'bar','Bar'],[80,'gel','Gel'],[100,'bottle','Drink'],[115,'smile','Keep going']],
  route: [[25,'mountain','Climb · 3.2 km · 6%'],[58,'feed','Feed zone'],[83,'mountain','Climb · 7.1 km · 5%'],[120,'flag','Finish']]
};

// Supplied Tour-of-Flanders-distance.csv: example ride plan, no edition/year supplied.
export const FLANDERS_CUES=[
 [20,"bar","",""],
 [40,"bottle","",""],
 [60,"bar","",""],
 [80,"gel","",""],
 [100,"bottle","",""],
 [120,"bottle","",""],
 [135,"cobbles","Kwaremont",""],
 [150,"bottle","",""],
 [160,"","",""],
 [170,"bottle","",""],
 [180,"","",""],
 [190,"bottle","",""],
 [200,"smile","",""],
 [217,"cobbles","Kwaremont",""],
 [230,"bottle","",""],
 [240,"bottle","",""],
 [255,"cobbles","Kwaremont",""],
 [265,"bottle","",""],
 [272,"flag","Finish",""]
];
