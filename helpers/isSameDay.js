module.exports = isSameDay = (date1, date2) => {
  date1 = new Date(date1)
  date2 = new Date(date2)
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};
