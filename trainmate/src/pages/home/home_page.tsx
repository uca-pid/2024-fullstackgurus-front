import React, { useEffect, useMemo, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { grey } from '@mui/material/colors';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { Dumbbell, Timer, Bike, Trophy } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import Typography from '@mui/material/Typography';
import ScrollArea from '@mui/material/Box';
import { getWorkouts, saveWorkout, getWorkoutsCalories } from '../../api/WorkoutsApi';
import { calculate_calories_per_day } from '../../functions/calculations';
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import TopMiddleAlert from '../../personalizedComponents/TopMiddleAlert';
import { getCategories } from '../../api/CategoryApi';
import { getExerciseFromCategory } from '../../api/ExerciseApi';
import { getCoaches } from '../../api/CoachesApi_external';

interface Exercise {
  id: number;
  exercise: string;
  duration: number;
  date: string;
  calories: number;
}

interface Category {
  category_id: string;
  icon: string,
  name: string;
  owner: string;
  isCustom: boolean;
}

interface ExerciseFromCategory {
  exercise_id: string;
  calories_per_hour: number;
  category_id: string;
  name: string;
  owner: string;
  public: boolean;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('month');
  const [open, setOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [exerciseList, setExerciseList] = useState<Exercise[]>([]);
  const [caloriesPerDay, setCaloriesPerDay] = useState<{ [date: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [exerciseCount, setExerciseCount] = useState(0);
  const [openExerciseAdding, setOpenExerciseAdding] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [exercisesFromCategory, setExercisesFromCategory] = useState<ExerciseFromCategory[]>([]);
  const [coaches, setCoaches] = useState([]);
  const [coachSelected, setCoachSelected] = useState('');

  const handleAvatarClick = () => {
    navigate('/profile');
  };

  const handleCategoriesClick = () => {
    navigate('/categories');
  }

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}`;
  };

  const getAllWorkouts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token no encontrado');
  
      const workouts = await getWorkouts(token);
      return Array.isArray(workouts) ? workouts : [];
    } catch (error) {
      console.error('Error al obtener todos los entrenamientos:', error);
      return [];
    }
  };
  
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true);
        const workouts = await getAllWorkouts();
        const validWorkouts = workouts.filter((exercise: Exercise) => 
          exercise.exercise && exercise.duration && exercise.date && exercise.calories
        );
        const sortedWorkouts = validWorkouts.sort((a: Exercise, b: Exercise) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setExerciseList(sortedWorkouts);
      } catch (error) {
        console.error('Error al obtener los entrenamientos:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchWorkouts();
  }, [exerciseCount]);

  const getAllWorkoutsCalories = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token no encontrado');
  
      const workouts_data = await getWorkoutsCalories(token);
      const workouts_calories_and_dates = workouts_data.workouts_calories_and_dates;
      return Array.isArray(workouts_calories_and_dates) ? workouts_calories_and_dates : [];
    } catch (error) {
      console.error('Error al obtener toda la data de los entrenamientos:', error);
      return [];
    }
  };

  const formatDataForChart = () => {
    return Object.keys(caloriesPerDay)
      .map(date => ({
        date: formatDate(date),
        calories: caloriesPerDay[date],
      }))
      .sort((b, a) => new Date(b.date.split('/').reverse().join('-')).getTime() - new Date(a.date.split('/').reverse().join('-')).getTime());
  };

  useEffect(() => {
    const fetchWorkoutsCalories = async () => {
      try {
        //setLoading(true);
        const workouts_calories_and_dates = await getAllWorkoutsCalories();
        const calories_per_day = calculate_calories_per_day(workouts_calories_and_dates);
        setCaloriesPerDay(calories_per_day);
      } catch (error) {
        console.error('Error al obtener toda la data de los entrenamientos:', error);
      } finally {
        //setLoading(false);
      }
    };
    fetchWorkoutsCalories();
  }, [exerciseCount]);

  const dataForChart = useMemo(() => formatDataForChart(), [caloriesPerDay]);

  const [newExercise, setNewExercise] = useState({
    type: '',
    duration: '',
    date: new Date().toISOString().split('T')[0],
  });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpenExerciseAdding = () => {
    setOpenExerciseAdding(true);
    setOpen(false);
  }

  const handleCloseExerciseAdding = () => {
    setOpenExerciseAdding(false);
    setOpen(true);
    setSelectedCategory(null);
    setExercisesFromCategory([]);
    setCoachSelected('');
  }

  const handleAddExercise = async () => {
    if (newExercise.type && newExercise.duration && newExercise.date) {
  
      setNewExercise({
        type: '',
        duration: '',
        date: new Date().toISOString().split('T')[0],
      });

      try {
        const token = localStorage.getItem('token');
        if (token) {
          await saveWorkout(token, {
            exercise: newExercise.type,
            duration: parseInt(newExercise.duration, 10),
            date: newExercise.date,
          });
          console.log('Workout saved successfully');
          setExerciseCount((prevCount) => prevCount + 1);
          setAlertOpen(true);
        } else {
          console.error('No token found, unable to save workout');
        }
      } catch (error) {
        console.error('Error saving workout:', error);
      }
  
      handleCloseExerciseAdding();
      handleClose();
    }
  };

  const getAllCategories = async () => {
    try {
      const categories = await getCategories();
      return Array.isArray(categories) ? categories : [];
    } catch (error) {
      console.error('Error al obtener todas las categorías:', error);
      return [];
    }
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getAllCategories();
        setCategories(categories);
      } catch (error) {
        console.error('Error al obtener las categorías:', error);
      }
    };
    fetchCategories();
  },[]);

  const getExercisesFromCategory = async (category_id: String) => {
    try {
      const exercises = await getExerciseFromCategory(category_id);
      setExercisesFromCategory(Array.isArray(exercises) ? exercises : []);
    } catch (error) {
      console.error('Error al obtener todas las categorías:', error);
      return [];
    }
  }

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const coaches = await getCoaches();
        setCoaches(coaches);
      } catch (error) {
        console.error('Error al obtener los profesores:', error);
      }
    };
    fetchCoaches();
  },[]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="p-4 flex justify-between items-center">
        <Avatar alt="User" src={require('../../images/profile_pic_2.jpg')} onClick={handleAvatarClick} style={{ cursor: 'pointer' }}/>
        <IconButton aria-label="add" onClick={handleClickOpen}>
          <AddCircleOutlineIcon sx={{ color: grey[50], fontSize: 40 }} className="h-24 w-24" />
          <div>
            <p className='p-3 text-white'>Add New</p>
          </div>
        </IconButton>
      </header>
      <TopMiddleAlert alertText='Added excercise successfully' open={alertOpen} onClose={() => setAlertOpen(false)}/>
      <Dialog open={open} onClose={handleClose}
        PaperProps={{
          sx: {
            backgroundColor: grey[800],
            color: '#fff',
            borderRadius: '8px',
            padding: 2,
          },
        }}>
        <DialogActions>
          <IconButton aria-label="add" onClick={handleClose}>
            <CloseIcon sx={{ color: grey[900], fontSize: 40 }} className="h-12 w-12" />
          </IconButton>
        </DialogActions>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', mt:-7 }}>What do you want to add?</DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="space-around" alignItems="center" mt={2}>

            <Box textAlign="center" mx={3}>
              <IconButton onClick={handleCategoriesClick}>
                <Avatar
                  style={{ border: '2px solid black' }}
                  alt="New Categories"
                  src={require('../../images/Sports2.png')}
                  sx={{ width: 150, height: 150 }}
                />
              </IconButton>
              <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold'}}>
                New Category or Sport
              </Typography>
            </Box>

            <Box textAlign="center" mx={3}>
              <IconButton onClick={handleOpenExerciseAdding}>
                <Avatar
                  style={{ border: '2px solid black' }}
                  alt="New Workout"
                  src={require('../../images/Exercise2.png')}
                  sx={{ width: 150, height: 150 }}
                />
              </IconButton>
                <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
                New Workout
                </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={openExerciseAdding} onClose={handleCloseExerciseAdding} 
        PaperProps={{
          sx: {
            backgroundColor: grey[800],
            color: '#fff',
            borderRadius: '8px',
            padding: 2,
          },
        }}>
        <DialogTitle sx={{ color: '#fff', textAlign: 'center' }}>Add New Workout</DialogTitle>
        <DialogContent>

        <Select
            fullWidth
            value={selectedCategory?.category_id || ""}
            onChange={(e) => {setSelectedCategory(categories.find((category) => category.category_id === e.target.value) || null); getExercisesFromCategory(e.target.value)}}
            displayEmpty
            sx={{ marginBottom: 1 }}
            MenuProps={{
              PaperProps: {
                sx: {
                  display: 'flex',
                  flexWrap: 'wrap',
                  maxWidth: 300,
                  padding: 1,
                  backgroundColor: '#444',
                  color: '#fff',
                },
              },
            }}
          >
            <MenuItem value="" disabled>
              Select Category
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.category_id} value={category.category_id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>

          <Select
            fullWidth
            value={newExercise.type}
            onChange={(e) => setNewExercise({ ...newExercise, type: e.target.value })}
            displayEmpty
            sx={{ marginBottom: 1 }}
            MenuProps={{
              PaperProps: {
                sx: {
                  display: 'flex',
                  flexWrap: 'wrap',
                  maxWidth: 300,
                  padding: 1,
                  backgroundColor: '#444',
                  color: '#fff',
                },
              },
            }}
          >
            <MenuItem value="" disabled>
              Select Exercise Type
            </MenuItem>
            {exercisesFromCategory.map((exerciseFromCategory) => (
              <MenuItem key={exerciseFromCategory.exercise_id} value={exerciseFromCategory.exercise_id}>
                {exerciseFromCategory.name}
              </MenuItem>
            ))}
          </Select>

          <Select
            fullWidth
            value={coachSelected}
            onChange={(e) => setCoachSelected(e.target.value)}
            displayEmpty
            MenuProps={{
              PaperProps: {
                sx: {
                  display: 'flex',
                  flexWrap: 'wrap',
                  maxWidth: 300,
                  padding: 1,
                  backgroundColor: '#444',
                  color: '#fff',
                },
              },
            }}
          >
            <MenuItem value="" disabled>
              Select Coach
            </MenuItem>
            {coaches.map((coach: any) => (
              <MenuItem key={coach.uid} value={coach.uid}>
                {coach.fullName}
              </MenuItem>
            ))}
          </Select>

          <TextField
            fullWidth
            margin="dense"
            label="Duration"
            value={newExercise.duration}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                setNewExercise({ ...newExercise, duration: "" });
              } else {
                const numericValue = parseInt(value, 10);
                if (numericValue >= 1 && numericValue <= 1000) {
                  setNewExercise({ ...newExercise, duration: value });
                } else if (numericValue < 1) {
                  setNewExercise({ ...newExercise, duration: "1" });
                } else if (numericValue > 1000) {
                  setNewExercise({ ...newExercise, duration: "1000" });
                }
              }
            }}
            placeholder="In minutes"
            type="number"
            slotProps={{
              htmlInput: { min: 1, max: 1000 }
            }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Date"
            type="date"
            value={newExercise.date}
            onChange={(e) => setNewExercise({ ...newExercise, date: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseExerciseAdding}>Cancel</Button>
          <Button onClick={handleAddExercise}>Add Workout</Button>
        </DialogActions>
      </Dialog>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
          <main className="p-4 space-y-6">
            <Card sx={{ backgroundColor: '#333', color: '#fff' }}>
              <CardHeader
                title="Progress"
                // action={
                //   <Select
                //     value={timeRange}
                //     onChange={(e) => setTimeRange(e.target.value)}
                //     sx={{ color: 'white' }}
                //   >
                //     <MenuItem value="week">Last Week</MenuItem>
                //     <MenuItem value="month">Last Month</MenuItem>
                //     <MenuItem value="year">Last Year</MenuItem>
                //   </Select>
                // }
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                {Array.isArray(exerciseList) && exerciseList.length > 0 ? (
                  <LineChart data={dataForChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="#fff" tick={{ dy: 13 }} />
                    <YAxis stroke="#fff" />
                    <Tooltip />
                    <Line type="monotone" dataKey="calories" stroke="#008000" activeDot={{ r: 10 }} />
                  </LineChart>
                  ) : (
                    <div>
                      <Typography variant="body2" color="gray">No progress available</Typography>
                      <a href="#" className="underline" onClick={handleClickOpen}>
                        <Typography sx={{marginTop: 4}} variant="body2" color="gray">Add new workout</Typography>
                      </a>
                      
                    </div>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card sx={{ backgroundColor: '#333', color: '#fff' }}>
              <CardHeader title="Recent Exercises" />
              <CardContent>
              <ScrollArea sx={{ maxHeight: 300, overflow: 'auto' }}>
                {Array.isArray(exerciseList) && exerciseList.length > 0 ? (
                  exerciseList.map((exercise: any) => (
                    <div key={exercise.id} className="flex items-center space-x-4 mb-4">
                      <div className="bg-primary rounded-full p-2">
                        {exercise.exercise === 'Running' && <Timer className="h-6 w-6" />}
                        {exercise.exercise === 'Weightlifting' && <Dumbbell className="h-6 w-6" />}
                        {exercise.exercise === 'Cycling' && <Bike className="h-6 w-6" />}
                        {(exercise.exercise !== 'Running' && exercise.exercise !== 'Weightlifting' && exercise.exercise !== 'Cycling') && <Trophy className="h-6 w-6" />}
                      </div>
                      <div className="flex-1">
                        <Typography variant="h6">{exercise.exercise}</Typography>
                        <Typography variant="body2" color="gray">
                          {exercise.duration} min | {formatDate(exercise.date)}
                        </Typography>
                      </div>
                      <div className="text-right">
                        <Typography variant="h6">{exercise.calories} kcal</Typography>
                      </div>
                    </div>
                  ))
                ) : (
                  <Typography variant="body2" color="gray">No exercises available</Typography>
                )}
              </ScrollArea>
            </CardContent>
            </Card>
          </main>
        )}
    </div>
  );
}