import dayjs from 'dayjs';

export const getCurrentTimeInt = () => {
  return dayjs().unix();
};
