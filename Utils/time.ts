const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const pad = (num: number, size: number): string => {
    let s = num.toString();
    while (s.length < size) s = "0" + s;
    return s;
};

export const getCurrentDate = (format?: string): string => {
    const check_format = format?.toLowerCase() || "default";

    const now = new Date();
    const day = pad(now.getDate(), 2);
    const month = pad(now.getMonth() + 1, 2);
    const year = now.getFullYear().toString();

    switch (check_format) {
        case "yyyy-mmm-dd":
            return `${year}-${months[now.getMonth()]}-${day}`;
        case "yy-mm-dd":
            return `${year.slice(-2)}-${month}-${day}`;
        case "dd-mm-yyyy":
            return `${day}-${month}-${year}`;
        case "dd-mmm-yyyy":
            return `${day}-${months[now.getMonth()]}-${year}`;
        default:
            return `${year}-${month}-${day}`;
    }
};

export const getCurrentTime = (): string => {
    const now = new Date();
    const hours = pad(now.getHours(), 2);
    const minutes = pad(now.getMinutes(), 2);
    const seconds = pad(now.getSeconds(), 2);
    const milliseconds = pad(now.getMilliseconds(), 3);
    return `${hours}:${minutes}:${seconds}:${milliseconds}`;
};

export const getCurrentDateTime = (): string => {
    return `${getCurrentDate("dd-mmm-yyyy")} ${getCurrentTime()}`;
};
