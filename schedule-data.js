// Optional static schedule source for faster reads in Workers runtime.
// If a group has lessons here, bot uses this data instead of D1 schedule table.
// If a group is missing here, bot falls back to D1 automatically.
//
// Supported shape:
// export const STATIC_SCHEDULE = [
//   {
//     group_name: '2-7',
//     day_of_week: 'Monday',
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
  }
];
