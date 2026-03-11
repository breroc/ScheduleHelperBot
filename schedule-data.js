// Primary static schedule source for the bot.
// Timetable commands and cron jobs read lessons from this file.
// Keep one flat array of lesson objects; db.js validates rows on load.
//
// Supported shape:
// export const STATIC_SCHEDULE = [
//   {
//     group_name: '2-7',
//     day_of_week: 'monday',
//     lesson_number: 1,
//     subject: 'Intermediate Chinese Reading I',
//     teacher: 'Zhang Xizhi',
//     classroom: '31-105',
//     start_time: '08:00',
//     end_time: '09:30'
//   }
// ];

export const STATIC_SCHEDULE = [
  {
    group_name: '1-7',
    day_of_week: 'monday',
    lesson_number: 1,
    subject: 'Elementary Chinese Comprehensive I',
    teacher: 'Mao Han',
    classroom: '留1-402',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '1-7',
    day_of_week: 'monday',
    lesson_number: 2,
    subject: 'Elementary Chinese Listening I',
    teacher: 'Yang Ting',
    classroom: '留1-402',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '1-7',
    day_of_week: 'tuesday',
    lesson_number: 1,
    subject: 'Elementary Chinese Comprehensive I',
    teacher: 'Mao Han',
    classroom: '留1-402',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '1-7',
    day_of_week: 'tuesday',
    lesson_number: 2,
    subject: 'Elementary Chinese Speaking I',
    teacher: 'Wei Yuanyuan',
    classroom: '留1-402',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '1-7',
    day_of_week: 'wednesday',
    lesson_number: 1,
    subject: 'Elementary Chinese Listening I',
    teacher: 'Yang Ting',
    classroom: '留1-402',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '1-7',
    day_of_week: 'wednesday',
    lesson_number: 2,
    subject: 'Elementary Chinese Comprehensive I',
    teacher: 'Mao Han',
    classroom: '留1-402',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '1-7',
    day_of_week: 'thursday',
    lesson_number: 1,
    subject: 'Elementary Chinese Speaking I',
    teacher: 'Wei Yuanyuan',
    classroom: '留1-402',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '1-7',
    day_of_week: 'thursday',
    lesson_number: 2,
    subject: 'Elementary Chinese Comprehensive I',
    teacher: 'Mao Han',
    classroom: '留1-402',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '1-7',
    day_of_week: 'friday',
    lesson_number: 1,
    subject: 'Elementary Chinese Comprehensive I',
    teacher: 'Mao Han',
    classroom: '留1-402',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '2-1',
    day_of_week: 'monday',
    lesson_number: 1,
    subject: 'Elementary Chinese Speaking II',
    teacher: 'Li Xianjing',
    classroom: '留1-501',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '2-1',
    day_of_week: 'monday',
    lesson_number: 2,
    subject: 'Elementary Chinese Intensive Reading II',
    teacher: 'Qiu Tingting',
    classroom: '留1-501',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '2-1',
    day_of_week: 'tuesday',
    lesson_number: 1,
    subject: 'Elementary Chinese Intensive Reading II',
    teacher: 'Qiu Tingting',
    classroom: '留1-501',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '2-1',
    day_of_week: 'wednesday',
    lesson_number: 1,
    subject: 'Elementary Chinese Intensive Reading II',
    teacher: 'Qiu Tingting',
    classroom: '留1-501',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '2-1',
    day_of_week: 'wednesday',
    lesson_number: 2,
    subject: 'Elementary Chinese Listening II',
    teacher: 'Tao Hongyang',
    classroom: '留1-501',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '2-1',
    day_of_week: 'thursday',
    lesson_number: 1,
    subject: 'Elementary Chinese Intensive Reading II',
    teacher: 'Qiu Tingting',
    classroom: '留1-501',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '2-1',
    day_of_week: 'thursday',
    lesson_number: 2,
    subject: 'Elementary Chinese Speaking II',
    teacher: 'Li Xianjing',
    classroom: '留1-501',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '2-1',
    day_of_week: 'friday',
    lesson_number: 1,
    subject: 'Elementary Chinese Intensive Reading II',
    teacher: 'Qiu Tingting',
    classroom: '留1-602',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '2-1',
    day_of_week: 'friday',
    lesson_number: 2,
    subject: 'Elementary Chinese Listening II',
    teacher: 'Tao Hongyang',
    classroom: '留1-602',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '2-2',
    day_of_week: 'monday',
    lesson_number: 1,
    subject: 'Intensive Reading II',
    teacher: 'Qiu Tingting',
    classroom: '1-601',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '2-2',
    day_of_week: 'monday',
    lesson_number: 2,
    subject: 'Spoken Chinese II',
    teacher: 'Zheng Yadan',
    classroom: '1-601',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '2-2',
    day_of_week: 'tuesday',
    lesson_number: 1,
    subject: 'Intensive Reading II',
    teacher: 'Qiu Tingting',
    classroom: '1-601',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '2-2',
    day_of_week: 'wednesday',
    lesson_number: 1,
    subject: 'Intensive Reading II',
    teacher: 'Qiu Tingting',
    classroom: '1-601',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '2-2',
    day_of_week: 'wednesday',
    lesson_number: 2,
    subject: 'Chinese Listening II',
    teacher: 'Tao Hongyang',
    classroom: '1-601',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '2-2',
    day_of_week: 'thursday',
    lesson_number: 1,
    subject: 'Spoken Chinese II',
    teacher: 'Zheng Yadan',
    classroom: '1-601',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '2-2',
    day_of_week: 'thursday',
    lesson_number: 2,
    subject: 'Intensive Reading II',
    teacher: 'Qiu Tingting',
    classroom: '1-601',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '2-2',
    day_of_week: 'friday',
    lesson_number: 1,
    subject: 'Chinese Listening II',
    teacher: 'Tao Hongyang',
    classroom: '1-601',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '2-2',
    day_of_week: 'friday',
    lesson_number: 2,
    subject: 'Intensive Reading II',
    teacher: 'Qiu Tingting',
    classroom: '1-601',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '2-4',
    day_of_week: 'monday',
    lesson_number: 1,
    subject: 'Elementary Chinese Intensive Reading II',
    teacher: 'Zhang Jing',
    classroom: '留1-601',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '2-4',
    day_of_week: 'monday',
    lesson_number: 2,
    subject: 'Elementary Chinese Speaking II',
    teacher: 'Zheng Yadan',
    classroom: '留1-302',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '2-4',
    day_of_week: 'tuesday',
    lesson_number: 1,
    subject: 'Elementary Chinese Intensive Reading II',
    teacher: 'Zhang Jing',
    classroom: '留1-602',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '2-4',
    day_of_week: 'wednesday',
    lesson_number: 1,
    subject: 'Elementary Chinese Listening II',
    teacher: 'Chen Xiaoyan',
    classroom: '留1-602',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '2-4',
    day_of_week: 'wednesday',
    lesson_number: 2,
    subject: 'Elementary Chinese Intensive Reading II',
    teacher: 'Zhang Jing',
    classroom: '留1-602',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '2-4',
    day_of_week: 'thursday',
    lesson_number: 1,
    subject: 'Elementary Chinese Intensive Reading II',
    teacher: 'Zhang Jing',
    classroom: '留1-601',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '2-4',
    day_of_week: 'thursday',
    lesson_number: 2,
    subject: 'Elementary Chinese Speaking II',
    teacher: 'Zheng Yadan',
    classroom: '留1-601',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '2-4',
    day_of_week: 'friday',
    lesson_number: 1,
    subject: 'Elementary Chinese Listening II',
    teacher: 'Chen Xiaoyan',
    classroom: '留1-601',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '2-4',
    day_of_week: 'friday',
    lesson_number: 2,
    subject: 'Elementary Chinese Intensive Reading II',
    teacher: 'Zhang Jing',
    classroom: '留1-601',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '3-6',
    day_of_week: 'monday',
    lesson_number: 1,
    subject: 'Elementary Chinese Intensive Reading III',
    teacher: 'Huang Xiaofang',
    classroom: '31-117',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '3-6',
    day_of_week: 'monday',
    lesson_number: 2,
    subject: 'Elementary Chinese Speaking III',
    teacher: 'Wu Muhui',
    classroom: '31-117',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '3-6',
    day_of_week: 'tuesday',
    lesson_number: 1,
    subject: 'Elementary Chinese Reading III',
    teacher: 'Ren Shan',
    classroom: '31-117',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '3-6',
    day_of_week: 'tuesday',
    lesson_number: 2,
    subject: 'Elementary Chinese Intensive Reading III',
    teacher: 'Huang Xiaofang',
    classroom: '31-117',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '3-6',
    day_of_week: 'wednesday',
    lesson_number: 1,
    subject: 'Elementary Chinese Listening III',
    teacher: 'Li Jia',
    classroom: '31-117',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '3-6',
    day_of_week: 'wednesday',
    lesson_number: 2,
    subject: 'Elementary Chinese Speaking III',
    teacher: 'Wu Muhui',
    classroom: '31-117',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '3-6',
    day_of_week: 'thursday',
    lesson_number: 1,
    subject: 'Elementary Chinese Reading III',
    teacher: 'Ren Shan',
    classroom: '31-117',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '3-6',
    day_of_week: 'thursday',
    lesson_number: 2,
    subject: 'Elementary Chinese Intensive Reading III',
    teacher: 'Huang Xiaofang',
    classroom: '31-117',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '3-6',
    day_of_week: 'friday',
    lesson_number: 1,
    subject: 'Elementary Chinese Intensive Reading III',
    teacher: 'Huang Xiaofang',
    classroom: '31-117',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '2-8',
    day_of_week: 'monday',
    lesson_number: 1,
    subject: 'Chinese Speaking II',
    teacher: 'Duan Qianwen',
    classroom: '31-109',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '2-8',
    day_of_week: 'monday',
    lesson_number: 2,
    subject: 'Intensive Chinese Reading II',
    teacher: 'Zhang Xizhi',
    classroom: '31-109',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '2-8',
    day_of_week: 'tuesday',
    lesson_number: 1,
    subject: 'Chinese Listening II',
    teacher: 'Chen Farong',
    classroom: '31-109',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '2-8',
    day_of_week: 'tuesday',
    lesson_number: 2,
    subject: 'Intensive Chinese Reading II',
    teacher: 'Zhang Xizhi',
    classroom: '31-109',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '2-8',
    day_of_week: 'wednesday',
    lesson_number: 1,
    subject: 'Intensive Chinese Reading II',
    teacher: 'Zhang Xizhi',
    classroom: '31-109',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '2-8',
    day_of_week: 'wednesday',
    lesson_number: 2,
    subject: 'Chinese Speaking II',
    teacher: 'Duan Qianwen',
    classroom: '31-109',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '2-8',
    day_of_week: 'thursday',
    lesson_number: 1,
    subject: 'Intensive Chinese Reading II',
    teacher: 'Zhang Xizhi',
    classroom: '31-109',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '2-8',
    day_of_week: 'thursday',
    lesson_number: 2,
    subject: 'Chinese Listening II',
    teacher: 'Chen Farong',
    classroom: '31-109',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '2-8',
    day_of_week: 'friday',
    lesson_number: 1,
    subject: 'Intensive Chinese Reading II',
    teacher: 'Zhang Xizhi',
    classroom: '31-109',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '2-6',
    day_of_week: 'monday',
    lesson_number: 1,
    subject: 'Chinese Listening II',
    teacher: 'Chen Linxin',
    classroom: '31-107',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '2-6',
    day_of_week: 'monday',
    lesson_number: 2,
    subject: 'Chinese Intensive Reading II',
    teacher: 'Su Mingming',
    classroom: '31-107',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '2-6',
    day_of_week: 'tuesday',
    lesson_number: 1,
    subject: 'Chinese Intensive Reading II',
    teacher: 'Su Mingming',
    classroom: '31-107',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '2-6',
    day_of_week: 'wednesday',
    lesson_number: 1,
    subject: 'Chinese Reading II',
    teacher: 'Duan Yiwen',
    classroom: '31-107',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '2-6',
    day_of_week: 'wednesday',
    lesson_number: 2,
    subject: 'Chinese Intensive Reading II',
    teacher: 'Su Mingming',
    classroom: '31-107',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '2-6',
    day_of_week: 'thursday',
    lesson_number: 1,
    subject: 'Chinese Listening II',
    teacher: 'Su Mingming',
    classroom: '31-107',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '2-6',
    day_of_week: 'thursday',
    lesson_number: 2,
    subject: 'Chinese Speaking II',
    teacher: 'Chen Linxin',
    classroom: '31-107',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '2-6',
    day_of_week: 'friday',
    lesson_number: 1,
    subject: 'Chinese Reading II',
    teacher: 'Duan Yiwen',
    classroom: '31-107',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '2-6',
    day_of_week: 'friday',
    lesson_number: 2,
    subject: 'Chinese Intensive Reading II',
    teacher: 'Su Mingming',
    classroom: '31-107',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '2-7',
    day_of_week: 'monday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Reading II',
    teacher: 'Zhang Xizhi',
    classroom: '31-105',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '2-7',
    day_of_week: 'monday',
    lesson_number: 2,
    subject: 'Intermediate Chinese Speaking II',
    teacher: 'Wei Wenxu',
    classroom: '31-105',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '2-7',
    day_of_week: 'tuesday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Reading II',
    teacher: 'Zhang Xizhi',
    classroom: '31-105',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '2-7',
    day_of_week: 'wednesday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Listening II',
    teacher: 'Wang Yiwei',
    classroom: '31-107',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '2-7',
    day_of_week: 'wednesday',
    lesson_number: 2,
    subject: 'Intermediate Chinese Reading II',
    teacher: 'Zhang Xizhi',
    classroom: '31-107',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '2-7',
    day_of_week: 'thursday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Speaking II',
    teacher: 'Wei Wenxu',
    classroom: '31-105',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '2-7',
    day_of_week: 'thursday',
    lesson_number: 2,
    subject: 'Intermediate Chinese Reading II',
    teacher: 'Zhang Xizhi',
    classroom: '31-105',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '2-7',
    day_of_week: 'friday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Listening II',
    teacher: 'Wang Yiwei',
    classroom: '31-105',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '2-7',
    day_of_week: 'friday',
    lesson_number: 2,
    subject: 'Intermediate Chinese Reading II',
    teacher: 'Zhang Xizhi',
    classroom: '31-105',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '3-4',
    day_of_week: 'monday',
    lesson_number: 1,
    subject: 'Elementary Chinese Listening III',
    teacher: 'Yang Lu',
    classroom: '31-115',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '3-4',
    day_of_week: 'monday',
    lesson_number: 2,
    subject: 'Elementary Chinese Speaking III',
    teacher: 'Chen Xiaoyan',
    classroom: '31-115',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '3-4',
    day_of_week: 'tuesday',
    lesson_number: 1,
    subject: 'Elementary Chinese Reading III',
    teacher: 'Li Chaojing',
    classroom: '31-115',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '3-4',
    day_of_week: 'tuesday',
    lesson_number: 2,
    subject: 'Elementary Chinese Intensive Reading III',
    teacher: 'Wei Wenxu',
    classroom: '31-115',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '3-4',
    day_of_week: 'wednesday',
    lesson_number: 1,
    subject: 'Elementary Chinese Intensive Reading III',
    teacher: 'Wei Wenxu',
    classroom: '31-115',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '3-4',
    day_of_week: 'thursday',
    lesson_number: 1,
    subject: 'Elementary Chinese Intensive Reading III',
    teacher: 'Wei Wenxu',
    classroom: '31-115',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '3-4',
    day_of_week: 'thursday',
    lesson_number: 2,
    subject: 'Elementary Chinese Speaking III',
    teacher: 'Chen Xiaoyan',
    classroom: '31-115',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '3-4',
    day_of_week: 'friday',
    lesson_number: 1,
    subject: 'Elementary Chinese Intensive Reading III',
    teacher: 'Wei Wenxu',
    classroom: '31-115',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '3-4',
    day_of_week: 'friday',
    lesson_number: 2,
    subject: 'Elementary Chinese Reading III',
    teacher: 'Li Chaojing',
    classroom: '31-115',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '4-3',
    day_of_week: 'monday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Speaking I',
    teacher: 'Wu Dongmei',
    classroom: '31-112',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '4-3',
    day_of_week: 'monday',
    lesson_number: 2,
    subject: 'Intermediate Chinese Intensive Reading I',
    teacher: 'Song Ling',
    classroom: '31-112',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '4-3',
    day_of_week: 'tuesday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Reading I',
    teacher: 'Cheng Suwan',
    classroom: '31-112',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '4-3',
    day_of_week: 'tuesday',
    lesson_number: 2,
    subject: 'Intermediate Chinese Intensive Reading I',
    teacher: 'Song Ling',
    classroom: '31-112',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '4-3',
    day_of_week: 'wednesday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Speaking I',
    teacher: 'Wu Dongmei',
    classroom: '31-112',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '4-3',
    day_of_week: 'wednesday',
    lesson_number: 2,
    subject: 'Intermediate Chinese Intensive Reading I',
    teacher: 'Song Ling',
    classroom: '31-112',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '4-3',
    day_of_week: 'thursday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Intensive Reading I',
    teacher: 'Song Ling',
    classroom: '31-113',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '4-3',
    day_of_week: 'thursday',
    lesson_number: 2,
    subject: 'Intermediate Chinese Writing I',
    teacher: 'Guo Wenying',
    classroom: '31-113',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '4-3',
    day_of_week: 'friday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Reading I',
    teacher: 'Cheng Suwan',
    classroom: '31-117',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '4-4',
    day_of_week: 'monday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Intensive Reading I',
    teacher: 'Song Ling',
    classroom: '31-112',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '4-4',
    day_of_week: 'monday',
    lesson_number: 2,
    subject: 'Intermediate Chinese Reading I',
    teacher: 'Guo Yanjie',
    classroom: '31-112',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '4-4',
    day_of_week: 'tuesday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Writing I',
    teacher: 'Wei Yuanyuan',
    classroom: '31-112',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '4-4',
    day_of_week: 'tuesday',
    lesson_number: 2,
    subject: 'Intermediate Chinese Speaking I',
    teacher: 'Dong Liwei',
    classroom: '31-112',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '4-4',
    day_of_week: 'wednesday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Intensive Reading I',
    teacher: 'Song Ling',
    classroom: '31-112',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '4-4',
    day_of_week: 'thursday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Speaking I',
    teacher: 'Dong Liwei',
    classroom: '31-112',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '4-4',
    day_of_week: 'thursday',
    lesson_number: 2,
    subject: 'Intermediate Chinese Intensive Reading I',
    teacher: 'Song Ling',
    classroom: '31-112',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '4-4',
    day_of_week: 'friday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Reading I',
    teacher: 'Guo Yanjie',
    classroom: '31-112',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '4-4',
    day_of_week: 'friday',
    lesson_number: 2,
    subject: 'Intermediate Chinese Intensive Reading I',
    teacher: 'Song Ling',
    classroom: '31-112',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '4-6',
    day_of_week: 'monday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Reading I',
    teacher: 'Yang Lu',
    classroom: '31-116',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '4-6',
    day_of_week: 'monday',
    lesson_number: 2,
    subject: 'Intermediate Chinese Intensive Reading I',
    teacher: 'Feng Yu',
    classroom: '31-116',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '4-6',
    day_of_week: 'tuesday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Intensive Reading I',
    teacher: 'Feng Yu',
    classroom: '31-116',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '4-6',
    day_of_week: 'tuesday',
    lesson_number: 2,
    subject: 'Intermediate Chinese Speaking I',
    teacher: 'Lan Meng',
    classroom: '31-116',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '4-6',
    day_of_week: 'wednesday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Intensive Reading I',
    teacher: 'Feng Yu',
    classroom: '31-116',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '4-6',
    day_of_week: 'wednesday',
    lesson_number: 2,
    subject: 'Intermediate Chinese Reading I',
    teacher: 'Yang Lu',
    classroom: '31-116',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '4-6',
    day_of_week: 'thursday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Speaking I',
    teacher: 'Lan Meng',
    classroom: '31-116',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '4-6',
    day_of_week: 'thursday',
    lesson_number: 2,
    subject: 'Intermediate Chinese Writing I',
    teacher: 'Wei Shuyuan',
    classroom: '31-116',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '4-6',
    day_of_week: 'friday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Intensive Reading I',
    teacher: 'Feng Yu',
    classroom: '31-116',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '4-7',
    day_of_week: 'monday',
    lesson_number: 1,
    subject: 'Chinese Listening',
    teacher: 'Chen Yifan',
    classroom: '31-110',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '4-7',
    day_of_week: 'monday',
    lesson_number: 2,
    subject: 'Chinese Reading',
    teacher: 'Cheng Fang',
    classroom: '31-110',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '4-7',
    day_of_week: 'tuesday',
    lesson_number: 1,
    subject: 'Chinese Writing',
    teacher: 'Zhu Yaqin',
    classroom: '31-116',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '4-7',
    day_of_week: 'wednesday',
    lesson_number: 1,
    subject: 'Chinese Speaking',
    teacher: 'Dong Yifan',
    classroom: '31-110',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '4-7',
    day_of_week: 'wednesday',
    lesson_number: 2,
    subject: 'Chinese Reading',
    teacher: 'Chen Fang',
    classroom: '31-110',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '4-7',
    day_of_week: 'thursday',
    lesson_number: 1,
    subject: 'Chinese Listening',
    teacher: 'Cheng Fang',
    classroom: '31-110',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '4-7',
    day_of_week: 'thursday',
    lesson_number: 2,
    subject: 'Chinese Writing',
    teacher: 'Chen Yifan',
    classroom: '31-110',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '4-7',
    day_of_week: 'friday',
    lesson_number: 1,
    subject: 'Chinese Speaking',
    teacher: 'Dong Yifan',
    classroom: '31-110',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '4-7',
    day_of_week: 'friday',
    lesson_number: 2,
    subject: 'Chinese Reading',
    teacher: 'Chen Fang',
    classroom: '31-110',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '5-2',
    day_of_week: 'monday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Reading & Writing',
    teacher: 'Wang Jiayin',
    classroom: 'J7-304',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '5-2',
    day_of_week: 'tuesday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Reading & Writing',
    teacher: 'Wang Jiayin',
    classroom: 'J7-304',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '5-2',
    day_of_week: 'tuesday',
    lesson_number: 2,
    subject: 'Intermediate Chinese Speaking II',
    teacher: 'Zhu Jieling',
    classroom: 'J7-304',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '5-2',
    day_of_week: 'wednesday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Reading & Writing',
    teacher: 'Wang Jiayin',
    classroom: 'J7-304',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '5-2',
    day_of_week: 'wednesday',
    lesson_number: 2,
    subject: 'Intermediate Chinese Reading II',
    teacher: 'Xu Ying',
    classroom: 'J7-304',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '5-2',
    day_of_week: 'thursday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Reading & Writing',
    teacher: 'Wang Jiayin',
    classroom: 'J7-304',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '5-2',
    day_of_week: 'thursday',
    lesson_number: 2,
    subject: 'Intermediate Chinese Speaking II',
    teacher: 'Zhu Jieling',
    classroom: 'J7-304',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '5-2',
    day_of_week: 'friday',
    lesson_number: 1,
    subject: 'Intermediate Chinese Reading II',
    teacher: 'Xu Ying',
    classroom: 'J7-304',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '5-2',
    day_of_week: 'friday',
    lesson_number: 2,
    subject: 'Intermediate Chinese Speaking II',
    teacher: 'Zhu Jieling',
    classroom: 'J7-304',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '6-2',
    day_of_week: 'monday',
    lesson_number: 1,
    subject: 'Advanced Chinese Reading & Writing',
    teacher: 'Chen Jiahong',
    classroom: 'J7-302',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '6-2',
    day_of_week: 'monday',
    lesson_number: 2,
    subject: 'Advanced Chinese Reading',
    teacher: 'Huang Xiaofang',
    classroom: 'J7-302',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '6-2',
    day_of_week: 'tuesday',
    lesson_number: 1,
    subject: 'Advanced Chinese Speaking',
    teacher: 'Chen Qin',
    classroom: 'J7-302',
    start_time: '13:00',
    end_time: '14:30'
  },
  {
    group_name: '6-2',
    day_of_week: 'tuesday',
    lesson_number: 2,
    subject: 'Advanced Chinese Reading & Writing',
    teacher: 'Chen Jiahong',
    classroom: 'J7-302',
    start_time: '14:45',
    end_time: '16:15'
  },
  {
    group_name: '6-2',
    day_of_week: 'wednesday',
    lesson_number: 1,
    subject: 'Advanced Chinese Reading',
    teacher: 'Huang Xiaofang',
    classroom: 'J7-308',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '6-2',
    day_of_week: 'wednesday',
    lesson_number: 2,
    subject: 'Advanced Chinese Reading & Writing',
    teacher: 'Chen Jiahong',
    classroom: 'J7-308',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '6-2',
    day_of_week: 'thursday',
    lesson_number: 1,
    subject: 'Advanced Chinese Speaking',
    teacher: 'Chen Qin',
    classroom: 'J7-308',
    start_time: '08:00',
    end_time: '09:30'
  },
  {
    group_name: '6-2',
    day_of_week: 'thursday',
    lesson_number: 2,
    subject: 'Advanced Chinese Reading & Writing',
    teacher: 'Chen Jiahong',
    classroom: 'J7-308',
    start_time: '10:00',
    end_time: '11:30'
  },
  {
    group_name: '6-2',
    day_of_week: 'friday',
    lesson_number: 1,
    subject: 'Advanced Chinese Reading & Writing',
    teacher: 'Chen Jiahong',
    classroom: 'J7-308',
    start_time: '08:00',
    end_time: '09:30'
  }
];
