import moment from "moment";

export const readableDate = (date: Date | string, format: string): string => {
  if (format) return moment(date).format(format);
  return moment(date).fromNow();
};

export const numberWithCommas = (x: number): string => {
  if (x === 0) return x.toString();
  if (!x) return "";
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
