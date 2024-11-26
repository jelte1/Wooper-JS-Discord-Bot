/**
 * Calculates the skill level and related information based on the given experience points (xp).
 *
 * @param {number} xp - The experience points.
 * @returns {Promise<Object>} An object containing the skill level, percentage to next level,
 *                            experience points for the current level, experience points needed
 *                            for the next level, and a max level indicator.
 */
async function getSkillLevelFifty(xp) {
  const skillTable = {
    50 : 1,	
    175	: 2,
    375	: 3,
    675	: 4,
    1175 : 5,	
    1925 : 6,
    2925 : 7,	
    4425 : 8,
    6425 : 9,
    9925 : 10,	
    14925 :	11,
    22425 :	12,
    32425 :	13,
    47425 :	14,
    67425 :	15,
    97425 :	16,
    147425 : 17,	
    222425 : 18,
    322425 : 19,
    522425 : 20,	
    822425 : 21,
    1222425 : 22,	
    1722425 : 23,
    2322425 : 24,	
    3022425	: 25,
    3822425	: 26,
    4722425	: 27,
    5722425	: 28,
    6822425	: 29,
    8022425	: 30,
    9322425	: 31,
    10722425 : 32,	
    12222425 : 33,	
    13822425 : 34,	
    15522425 : 35,	
    17322425 : 36,
    19222425 : 37,	
    21222425 : 38,	
    23322425 : 39,	
    25522425 : 40,	
    27822425 : 41,	
    30222425 : 42,	
    32722425 : 43,	
    35322425 : 44,	
    38072425 : 45,	
    40972425 : 46,	
    44072425 : 47,	
    47472425 : 48,	
    51172425 : 49,	
    55172425 : 50,
  };
  let level = 0;
  let xpNeeded = 0;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = 0;
  let percentToNextLevel = 0;

  for (let xpNeededForLevel in skillTable) {
    xpNeededForLevel = parseInt(xpNeededForLevel);
    if (xp >= xpNeededForLevel) {
      level = skillTable[xpNeededForLevel];
      xpNeeded = xpNeededForLevel;
      xpForCurrentLevel = xpNeededForLevel;
    } else {
      xpForNextLevel = xpNeededForLevel;
      xpNeededForNextLevel = xpForNextLevel - xpNeeded;
      percentToNextLevel = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
      break;
    }
  }

  let max = '';
  if (xp >= 55172425) {
    percentToNextLevel = 100;
    max = '**MAX**';
    xpNeededForNextLevel = 0;
  }
  if (xp <= 0 || !xp) {
    percentToNextLevel = 0;
    xpForCurrentLevel = 1;
  }
  return {
    level,
    percentToNextLevel,
    xpForCurrentLevel,
    xpNeededForNextLevel,
    max,
  };
}

/**
 * Calculates the skill level and related information based on the given experience points (xp).
 *
 * @param {number} xp - The experience points.
 * @returns {Promise<Object>} An object containing the skill level, percentage to next level,
 *                            experience points for the current level, experience points needed
 *                            for the next level, and a max level indicator.
 */
async function getSkillLevel(xp) {
  const skillTable = {
    50 : 1,	
    175	: 2,
    375	: 3,
    675	: 4,
    1175 : 5,	
    1925 : 6,
    2925 : 7,	
    4425 : 8,
    6425 : 9,
    9925 : 10,	
    14925 :	11,
    22425 :	12,
    32425 :	13,
    47425 :	14,
    67425 :	15,
    97425 :	16,
    147425 : 17,	
    222425 : 18,
    322425 : 19,
    522425 : 20,	
    822425 : 21,
    1222425 : 22,	
    1722425 : 23,
    2322425 : 24,	
    3022425	: 25,
    3822425	: 26,
    4722425	: 27,
    5722425	: 28,
    6822425	: 29,
    8022425	: 30,
    9322425	: 31,
    10722425 : 32,	
    12222425 : 33,	
    13822425 : 34,	
    15522425 : 35,	
    17322425 : 36,
    19222425 : 37,	
    21222425 : 38,	
    23322425 : 39,	
    25522425 : 40,	
    27822425 : 41,	
    30222425 : 42,	
    32722425 : 43,	
    35322425 : 44,	
    38072425 : 45,	
    40972425 : 46,	
    44072425 : 47,	
    47472425 : 48,	
    51172425 : 49,	
    55172425 : 50,	
    59472425 : 51,	
    64072425 : 52,	
    68972425 : 53,	
    74172425 : 54,	
    79672425 : 55,	
    85472425 : 56,	
    91572425 : 57,	
    97972425 : 58,	
    104672425 : 59,	
    111672425 : 60,
  };
  let level = 0;
  let xpNeeded = 0;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = 0;
  let percentToNextLevel = 0;

  for (let xpNeededForLevel in skillTable) {
    xpNeededForLevel = parseInt(xpNeededForLevel);
    if (xp >= xpNeededForLevel) {
      level = skillTable[xpNeededForLevel];
      xpNeeded = xpNeededForLevel;
      xpForCurrentLevel = xpNeededForLevel;
    } else {
      xpForNextLevel = xpNeededForLevel;
      xpNeededForNextLevel = xpForNextLevel - xpNeeded;
      percentToNextLevel = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
      break;
    }
  }

  let max = '';
  if (xp >= 111672425) {
    percentToNextLevel = 100;
    max = '**MAX**';
    xpNeededForNextLevel = 0;
  }
  if (xp <= 0 || !xp) {
    percentToNextLevel = 0;
    xpForCurrentLevel = 1;
  }
  return {
    level,
    percentToNextLevel,
    xpForCurrentLevel,
    xpNeededForNextLevel,
    max,
  };
}

/**
 * Calculates the skill level and related information based on the given experience points (xp).
 *
 * @param {number} xp - The experience points.
 * @returns {Promise<Object>} An object containing the skill level, percentage to next level,
 *                            experience points for the current level, experience points needed
 *                            for the next level, and a max level indicator.
 */
async function getRuneSkillLevel(xp) {
  const skillTable2 = {
    50 : 1,	
    150	: 2,
    275	: 3,
    435	: 4,
    625 : 5,	
    885 : 6,
    1200 : 7,	
    1600 : 8,
    2100 : 9,
    2725 : 10,	
    3510 :	11,
    4510 :	12,
    5760 :	13,
    7325 :	14,
    9325 :	15,
    11825 :	16,
    14950 : 17,	
    18950 : 18,
    23950 : 19,
    30200 : 20,	
    38050 : 21,
    47850 : 22,	
    60100 : 23,
    75400 : 24,	
    94450	: 25,
  };
  let level = 0;
  let xpNeeded = 0;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = 0;
  let percentToNextLevel = 0;

  for (let xpNeededForLevel in skillTable2) {
    xpNeededForLevel = parseInt(xpNeededForLevel);
    if (xp >= xpNeededForLevel) {
      level = skillTable2[xpNeededForLevel];
      xpNeeded = xpNeededForLevel;
      xpForCurrentLevel = xpNeededForLevel;
    } else {
      xpForNextLevel = xpNeededForLevel;
      xpNeededForNextLevel = xpForNextLevel - xpNeeded;
      percentToNextLevel = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
      break;
    }
  }

  let max = '';
  if (xp >= 94450) {
    percentToNextLevel = 100;
    max = '**MAX**';
    xpNeededForNextLevel = 0;
  }
  if (xp <= 0 || !xp) {
    percentToNextLevel = 0;
    xpForCurrentLevel = 1;
  }
  return {
    level,
    percentToNextLevel,
    xpForCurrentLevel,
    xpNeededForNextLevel,
    max,
  };
}
async function getSocialSkillLevel(xp) {
  const skillTable2 = {
    50 : 1,	
    150	: 2,
    300	: 3,
    550	: 4,
    1050 : 5,	
    1800 : 6,
    2800 : 7,	
    4050 : 8,
    5550 : 9,
    7550 : 10,	
    10050 :	11,
    13050 :	12,
    16800 :	13,
    21300 :	14,
    27300 :	15,
    35300 :	16,
    45300 : 17,	
    57800 : 18,
    72800 : 19,
    92800 : 20,	
    117800 : 21,
    147800 : 22,	
    182800 : 23,
    222800 : 24,	
    272800 : 25,
  };
  let level = 0;
  let xpNeeded = 0;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = 0;
  let percentToNextLevel = 0;

  for (let xpNeededForLevel in skillTable2) {
    xpNeededForLevel = parseInt(xpNeededForLevel);
    if (xp >= xpNeededForLevel) {
      level = skillTable2[xpNeededForLevel];
      xpNeeded = xpNeededForLevel;
      xpForCurrentLevel = xpNeededForLevel;
    } else {
      xpForNextLevel = xpNeededForLevel;
      xpNeededForNextLevel = xpForNextLevel - xpNeeded;
      percentToNextLevel = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
      break;
    }
  }

  let max = '';
  if (xp >= 272800) {
    percentToNextLevel = 100;
    max = '**MAX**';
    xpNeededForNextLevel = 0;
  }
  if (xp <= 0 || !xp) {
    percentToNextLevel = 0;
    xpForCurrentLevel = 1;
  }
  return {
    level,
    percentToNextLevel,
    xpForCurrentLevel,
    xpNeededForNextLevel,
    max,
  };
}

/**
 * Calculates the skill level and related information based on the given experience points (xp).
 *
 * @param {number} xp - The experience points.
 * @returns {Promise<Object>} An object containing the skill level, percentage to next level,
 *                            experience points for the current level, experience points needed
 *                            for the next level, and a max level indicator.
 */
async function getDungeonSkillLevel(xp) {
  const skillTable3 = {
    50 : 1,	
    125	: 2,
    235	: 3,
    395	: 4,
    625 : 5,	
    955 : 6,
    1425 : 7,	
    2095  : 8,
    3045 : 9,
    4385 : 10,	
    6275 :	11,
    8940 :	12,
    12700 :	13,
    17960 :	14,
    25340 :	15,
    35640 :	16,
    50040 : 17,	
    70040 : 18,
    97640 : 19,
    135640 : 20,	
    188140 : 21,
    259640 : 22,	
    356640 : 23,
    488640 : 24,	
    668640	: 25,
    911640	: 26,
    1239640	: 27,
    1684640	: 28,
    2284640	: 29,
    3084640	: 30,
    4149640	: 31,
    5559640 : 32,	
    7459640 : 33,	
    9959640 : 34,	
    13259640 : 35,	
    17559640 : 36,	
    23159640 : 37,	
    30359640 : 38,	
    39559640 : 39,	
    51559640 : 40,
    66559640 : 41,	
    85559640 : 42,	
    109559640 :	43,
    139559640 :	44,
    177559640 : 45,
    225559640 :	46,
    285559640 :	47,
    360559640 :	48,
    453559640 :	49,
    569809640 :	50,
  };
  let level = 0;
  let xpNeeded = 0;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = 0;
  let percentToNextLevel = 0;

  for (let xpNeededForLevel in skillTable3) {
    xpNeededForLevel = parseInt(xpNeededForLevel);
    if (xp >= xpNeededForLevel) {
      level = skillTable3[xpNeededForLevel];
      xpNeeded = xpNeededForLevel;
      xpForCurrentLevel = xpNeededForLevel;
    } else {
      xpForNextLevel = xpNeededForLevel;
      xpNeededForNextLevel = xpForNextLevel - xpNeeded;
      percentToNextLevel = ((xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
      break;
    }
  }

  let max = '';
  if (xp >= 569809640) {
    percentToNextLevel = 100;
    max = '**MAX**';
    xpNeededForNextLevel = 0;
  }
  if (xp <= 0 || !xp) {
    percentToNextLevel = 0;
    xpForCurrentLevel = 1;
  }
  return {
    level,
    percentToNextLevel,
    xpForCurrentLevel,
    xpNeededForNextLevel,
    max,
  };
}

module.exports = {
  getSkillLevelFifty,
  getSkillLevel,
  getRuneSkillLevel,
  getSocialSkillLevel,
  getDungeonSkillLevel
};