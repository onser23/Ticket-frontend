const AZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun',
  'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
];

const AZ_WEEKDAYS = [
  'Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə',
  'Cümə axşamı', 'Cümə', 'Şənbə',
];

export function formatAzDate(date = new Date()) {
  const d = new Date(date);
  const day = d.getDate();
  const month = AZ_MONTHS[d.getMonth()];
  const weekday = AZ_WEEKDAYS[d.getDay()];
  const year = d.getFullYear();
  return `${day} ${month}, ${weekday} - ${year}`;
}
