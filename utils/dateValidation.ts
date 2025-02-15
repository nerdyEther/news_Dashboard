
export const getOneMonthAgo = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  };
  
  export const isDateWithinLastMonth = (date: Date) => {
    const oneMonthAgo = getOneMonthAgo();
    return date >= oneMonthAgo;
  };
  
  export const validateDateRange = (from: Date | undefined, to: Date | undefined) => {
    const today = new Date();
    const oneMonthAgo = getOneMonthAgo();
  
    if (from && to && from > to) {
      return {
        isValid: false,
        error: "Start date cannot be after end date"
      };
    }
  
    if (from && from > today || to && to > today) {
      return {
        isValid: false,
        error: "Cannot select future dates"
      };
    }
  
    if ((from && !isDateWithinLastMonth(from)) || (to && !isDateWithinLastMonth(to))) {
      return {
        isValid: false,
        error: "Free API access only allows articles from the past month"
      };
    }
  
    return { isValid: true, error: null };
  };