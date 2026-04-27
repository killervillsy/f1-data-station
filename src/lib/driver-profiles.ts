export type DriverProfile = {
  debutRace?: string;
  height?: string;
  weight?: string;
  nickname?: string;
  tCamColor?: string;
  salary?: string;
  contractStatus?: string;
  superLicencePenaltyPoints?: string;
  penaltyPointsPeriod?: string;
  birthPlace?: string;
  residence?: string;
  maritalStatus?: string;
  partner?: string;
  familyAndFriends?: string;
  fanImpression?: string;
  signature?: string;
};

const driverProfiles: Record<string, DriverProfile> = {
  albon: {
    debutRace: "2019 澳大利亚大奖赛",
    birthPlace: "英国伦敦",
    residence: "摩纳哥",
    fanImpression: "稳定、轮胎管理好，擅长在中下游赛车中拿分",
  },
  alonso: {
    debutRace: "2001 澳大利亚大奖赛",
    nickname: "El Nano",
    birthPlace: "西班牙奥维耶多",
    residence: "瑞士",
    maritalStatus: "离异",
    fanImpression: "经验丰富、比赛阅读能力强，防守和策略执行突出",
  },
  antonelli: {
    debutRace: "2025 澳大利亚大奖赛",
    birthPlace: "意大利博洛尼亚",
    fanImpression: "梅赛德斯青训出身，速度快、潜力高",
  },
  arvid_lindblad: {
    birthPlace: "英国弗吉尼亚沃特",
    fanImpression: "红牛青训车手，青年赛事表现受到关注",
  },
  bearman: {
    debutRace: "2024 沙特阿拉伯大奖赛",
    birthPlace: "英国切姆斯福德",
    fanImpression: "临场适应快，新秀首秀表现成熟",
  },
  bortoleto: {
    debutRace: "2025 澳大利亚大奖赛",
    birthPlace: "巴西圣保罗",
    fanImpression: "青年方程式冠军出身，节奏稳定",
  },
  bottas: {
    debutRace: "2013 澳大利亚大奖赛",
    birthPlace: "芬兰纳斯托拉",
    residence: "摩纳哥",
    fanImpression: "排位速度强，风格稳健",
  },
  colapinto: {
    debutRace: "2024 意大利大奖赛",
    birthPlace: "阿根廷皮拉尔",
    fanImpression: "阿根廷车迷支持度高，进步速度快",
  },
  gasly: {
    debutRace: "2017 马来西亚大奖赛",
    birthPlace: "法国鲁昂",
    residence: "意大利米兰",
    fanImpression: "单圈速度强，逆境中韧性突出",
  },
  hadjar: {
    debutRace: "2025 澳大利亚大奖赛",
    birthPlace: "法国巴黎",
    fanImpression: "红牛体系新秀，驾驶风格积极",
  },
  hamilton: {
    debutRace: "2007 澳大利亚大奖赛",
    nickname: "LH44",
    birthPlace: "英国斯蒂夫尼奇",
    residence: "摩纳哥",
    fanImpression: "七届世界冠军，排位、雨战和轮胎管理能力顶级",
  },
  hulkenberg: {
    debutRace: "2010 巴林大奖赛",
    nickname: "Hulk",
    birthPlace: "德国埃默里希",
    residence: "摩纳哥",
    maritalStatus: "已婚",
    fanImpression: "经验丰富、稳定可靠，常被认为正赛执行力强",
  },
  lawson: {
    debutRace: "2023 荷兰大奖赛",
    birthPlace: "新西兰黑斯廷斯",
    fanImpression: "替补上场表现冷静，竞争风格强硬",
  },
  leclerc: {
    debutRace: "2018 澳大利亚大奖赛",
    nickname: "Il Predestinato",
    birthPlace: "摩纳哥蒙特卡洛",
    residence: "摩纳哥",
    fanImpression: "单圈速度顶级，法拉利核心车手之一",
  },
  max_verstappen: {
    debutRace: "2015 澳大利亚大奖赛",
    nickname: "Super Max",
    birthPlace: "比利时哈瑟尔特",
    residence: "摩纳哥",
    fanImpression: "进攻性强、比赛控制力顶级，连续冠军时期统治力突出",
  },
  norris: {
    debutRace: "2019 澳大利亚大奖赛",
    birthPlace: "英国布里斯托尔",
    residence: "摩纳哥",
    fanImpression: "人气高、单圈速度强，社交媒体形象活跃",
  },
  ocon: {
    debutRace: "2016 比利时大奖赛",
    birthPlace: "法国埃夫勒",
    residence: "摩纳哥",
    fanImpression: "防守强硬，比赛对抗性强",
  },
  perez: {
    debutRace: "2011 澳大利亚大奖赛",
    nickname: "Checo",
    birthPlace: "墨西哥瓜达拉哈拉",
    residence: "墨西哥瓜达拉哈拉",
    maritalStatus: "已婚",
    fanImpression: "轮胎管理突出，街道赛和逆境追击能力强",
  },
  piastri: {
    debutRace: "2023 巴林大奖赛",
    birthPlace: "澳大利亚墨尔本",
    residence: "英国",
    fanImpression: "冷静、高效，青年赛事履历强",
  },
  russell: {
    debutRace: "2019 澳大利亚大奖赛",
    birthPlace: "英国金斯林",
    residence: "摩纳哥",
    fanImpression: "排位速度快，技术反馈能力强",
  },
  sainz: {
    debutRace: "2015 澳大利亚大奖赛",
    nickname: "Smooth Operator",
    birthPlace: "西班牙马德里",
    residence: "西班牙马德里",
    fanImpression: "稳定全面，策略执行和比赛节奏控制出色",
  },
  stroll: {
    debutRace: "2017 澳大利亚大奖赛",
    birthPlace: "加拿大蒙特利尔",
    residence: "瑞士日内瓦",
    fanImpression: "起步和湿地表现有亮点，防守直接",
  },
};

export function getDriverProfile(driverId: string): DriverProfile {
  return driverProfiles[driverId] ?? {};
}

export function getZodiacSign(dateOfBirth: string): string | undefined {
  const [, monthValue, dayValue] = dateOfBirth.match(/^(\d{4})-(\d{2})-(\d{2})$/) ?? [];
  const month = Number(monthValue);
  const day = Number(dayValue);

  if (!month || !day) return undefined;

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "白羊座";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "金牛座";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return "双子座";
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return "巨蟹座";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "狮子座";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "处女座";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return "天秤座";
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return "天蝎座";
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return "射手座";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "摩羯座";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "水瓶座";
  return "双鱼座";
}
