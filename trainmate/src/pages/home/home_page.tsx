import React, { useEffect, useState } from 'react';
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
import { Dumbbell, Timer, Bike, Trophy } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import Typography from '@mui/material/Typography';
import ScrollArea from '@mui/material/Box';
import { getWorkouts, saveWorkout } from '../../api/WorkoutsApi';
import { get } from 'http';

const data = [
  { name: 'Week 1', calories: 420 },
  { name: 'Week 2', calories: 250 },
  { name: 'Week 3', calories: 700 },
  { name: 'Week 4', calories: 590 },
];

const exerciseTypes = [
  'Running', 'Weightlifting', 'Cycling', 'Swimming', 'Football', 'Basketball', 'Tennis', 'Gymnastics',
];

interface Exercise {
  id: number;
  exercise: string;
  duration: number;
  date: string;
  calories: number;
}

export default function HomePage() {
  const [timeRange, setTimeRange] = useState('month');
  const [open, setOpen] = useState(false);
  const [exerciseList, setExerciseList] = useState<Exercise[]>([]);
  const [addedExcercise, setAddedExercise] = useState(false);

  const getAllWorkouts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token no encontrado');
  
      const workouts = await getWorkouts(token);
      console.log(workouts);
      return Array.isArray(workouts) ? workouts : [];
    } catch (error) {
      console.error('Error al obtener todos los entrenamientos:', error);
      return [];
    }
  };
  
  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const workouts = await getAllWorkouts();
        const validWorkouts = workouts.filter((exercise: Exercise) => 
          exercise.exercise && exercise.duration && exercise.date && exercise.calories
        );
        setExerciseList(validWorkouts);
      } catch (error) {
        console.error('Error al obtener los entrenamientos:', error);
      }
    };
  
    fetchWorkouts();
  }, [addedExcercise]);

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

  const handleAddExercise = async () => {
    if (newExercise.type && newExercise.duration && newExercise.date) {
      const exercise = {
        id: exerciseList.length + 1,
        ...newExercise,
        calories: Math.floor(Math.random() * 300) + 100, // Generating a random calorie value
      };
  
      // setExerciseList([...exerciseList, exercise]);
  
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
          setAddedExercise(true);
        } else {
          console.error('No token found, unable to save workout');
        }
      } catch (error) {
        console.error('Error saving workout:', error);
      }
  
      handleClose();
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <header className="p-4 flex justify-between items-center">
        <Avatar alt="User" src={require('../../images/profile_pic.png')} />
        <IconButton aria-label="add" onClick={handleClickOpen}>
          <AddCircleOutlineIcon sx={{ color: grey[50], fontSize: 40 }} className="h-24 w-24" />
        </IconButton>
      </header>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Exercise</DialogTitle>
        <DialogContent>
          <Select
            fullWidth
            value={newExercise.type}
            onChange={(e) => setNewExercise({ ...newExercise, type: e.target.value })}
            displayEmpty
          >
            <MenuItem value="" disabled>
              Select Exercise Type
            </MenuItem>
            {exerciseTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
          <TextField
            fullWidth
            margin="dense"
            label="Duration"
            value={newExercise.duration}
            onChange={(e) => setNewExercise({ ...newExercise, duration: e.target.value })}
            placeholder="In minutes"
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddExercise}>Add Exercise</Button>
        </DialogActions>
      </Dialog>

      <main className="p-4 space-y-6">
        <Card sx={{ backgroundColor: '#333', color: '#fff' }}>
          <CardHeader
            title="Progress"
            action={
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                sx={{ color: 'white' }}
              >
                <MenuItem value="week">Last Week</MenuItem>
                <MenuItem value="month">Last Month</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
              </Select>
            }
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#fff" tick={{ dy: 13 }} />
                <YAxis stroke="#fff" />
                <Tooltip />
                <Line type="monotone" dataKey="calories" stroke="#008000" activeDot={{ r: 10 }} />
              </LineChart>
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
                      {exercise.duration} min | {exercise.date}
                    </Typography>
                  </div>
                  <div className="text-right">
                    <Typography variant="h6">{exercise.calories} kcal</Typography>
                  </div>
                </div>
              ))
            ) : (
              <Typography variant="body2" color="gray">No hay entrenamientos disponibles</Typography>
            )}
          </ScrollArea>
        </CardContent>
        </Card>
      </main>
    </div>
  );
}