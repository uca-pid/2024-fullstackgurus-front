interface Workout {
    id: number;
    duration: number;
    date: string;
    total_calories: number;
    coach: string;
    training_id: string;
  }
  
export const calculate_calories_per_day = (calories_and_dates: Workout[]) => {
    const calories_per_day: { [date: string]: number } = {};

    calories_and_dates.forEach((workout) => {
        const { date, total_calories } = workout;

        if (calories_per_day[date]) {
        calories_per_day[date] += total_calories;
        } else {
        calories_per_day[date] = total_calories;
        }
    });

    return calories_per_day;
};