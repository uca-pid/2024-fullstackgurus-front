import React, { useEffect, useState, useRef } from 'react';
import { Button, Card, CardContent, CardHeader, Typography, TextField, InputLabel, Box, Accordion, AccordionSummary, AccordionDetails, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, MenuItem, Select, FormControl, CircularProgress,} from '@mui/material';
import { Add as PlusIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowBack as ArrowLeftIcon, ExpandMore as ExpandMoreIcon, BorderColor,} from '@mui/icons-material';
import {FitnessCenter as DumbbellIcon, 
  SportsSoccer as BallIcon, 
  SportsBasketball as BasketballIcon, 
  SportsTennis as TennisIcon, 
  SportsKabaddi as FightIcon,
  SportsMartialArts as MartialIcon,
  SportsMma as MmaIcon,
  SportsMotorsports as MotorsportsIcon,
  Hiking as HikingIcon,
  Sailing as SailingIcon,
  DownhillSkiing as SkiingIcon,
  Pool as PoolIcon,
  Skateboarding as SkateIcon,
  SportsRugby as RugbyIcon,
  SportsVolleyball as VolleyballIcon, 
  Favorite as HeartIcon} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { grey } from '@mui/material/colors';
import { getCategories, saveCategory } from '../../api/CategoryApi';
import { getExerciseFromCategory } from '../../api/ExerciseApi';

interface CategoryWithExercises {
  category_id: string;
  icon: string,
  name: string;
  owner: string;
  isCustom: boolean;
  exercises: Exercise[];
}

interface Category {
  category_id: string;
  icon: string,
  name: string;
  owner: string;
  isCustom: boolean;
}

interface Exercise {
  exercise_id: string;
  calories_per_hour: number;
  category_id: string;
  name: string;
  owner: string;
  public: boolean;
}

interface NewCategory {
  name: string;
  icon: string;
}

interface NewExercise {
  calories_per_hour: number;
  category_id: string;
  name: string;
}

export default function CategoriesPage() {

  const navigate = useNavigate();
  const effectRan = useRef(false);
  const [loading, setLoading] = useState(true);

  const [categoryWithExercises, setCategoryWithExercises] = useState<CategoryWithExercises[]>([]);

  const [newCategory, setNewCategory] = useState<NewCategory | null>(null);
  const [newExercise, setNewExercise] = useState<NewExercise | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [addExerciseDialogOpen, setAddExerciseDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [editExerciseDialogOpen, setEditExerciseDialogOpen] = useState(false);

  const handleOpenAddCategoryDialog = () => setAddCategoryDialogOpen(true);
  const handleCloseAddCategoryDialog = () => setAddCategoryDialogOpen(false);


  const getAllCategories = async () => {
    try {
      const categories = await getCategories();
      return Array.isArray(categories) ? categories : [];
    } catch (error) {
      console.error('Error al obtener todas las categorías:', error);
      return [];
    }
  };

  useEffect(() => {
    // El effectRan lo utilizo para que el useEffect se ejecute solo una vez, ya que por default se ejecuta dos veces
    if (!effectRan.current) {
      const fetchCategories = async () => {
        try {
          setLoading(true);
          const categories = await getAllCategories();
          for (const category of categories) {
            await getExercisesFromCategory(category);
          }
        } catch (error) {
          console.error('Error al obtener las categorías:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchCategories();
      effectRan.current = true;
    }
  }, []);

  const getExercisesFromCategory = async (category: Category) => {
    try {
      const exercises = await getExerciseFromCategory(category.category_id);
      console.log("Setting category with exercises", category, exercises);
      setCategoryWithExercises((prev) => [
        ...prev,
        { ...category, exercises }
      ]);
    } catch (error) {
      console.error('Error al obtener todas las categorías:', error);
    }
  };

  const handleOpenAddExerciseDialog = (categoryId: string) => {
    setNewExercise({ ...newExercise, category_id: categoryId, calories_per_hour: newExercise?.calories_per_hour || 0, name: newExercise?.name || '' });
    setAddExerciseDialogOpen(true);
  };
  const handleCloseAddExerciseDialog = () => {
    setAddExerciseDialogOpen(false);
    setNewExercise(null);
  };

  const handleOpenEditCategoryDialog = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryDialogOpen(true);
  };
  const handleCloseEditCategoryDialog = () => {
    setEditCategoryDialogOpen(false);
    setEditingCategory(null);
  };

  const handleOpenEditExerciseDialog = (Exercise: Exercise) => {
    setEditingExercise(Exercise);
    setEditExerciseDialogOpen(true);
  };
  const handleCloseEditExerciseDialog = () => {
    setEditExerciseDialogOpen(false);
    setEditingExercise(null);
  };

  const handleAddCategory = async () => {
    if (newCategory && newCategory.name && newCategory.icon) {
      // Para evitar recargar la pagina de vuelta, hago un save en el front, mientras igualmente se guarda en el back. Esto es para evitar recarga lenta
      // y que se muestre inmediatamente la nueva categoría agregada
      try {
        const category = await saveCategory(newCategory);
        setNewCategory({ name: '', icon: '' });
        setCategoryWithExercises((prev) => [
          ...prev,
          { ...category, exercises: [] }
        ]);
      } catch (error) {
        console.error('Error al guardar la categoría:', error)
      }
      handleCloseAddCategoryDialog();
    }
  };

  const handleAddExercise = () => {
    if (newExercise && newExercise.name) {
      setCategoryWithExercises(
        categoryWithExercises.map((category) => {
          if (category.category_id === newExercise.category_id) {
            return {
              ...category,
              exercises: [
                ...category.exercises,
                {
                  exercise_id: Date.now().toString(),
                  name: newExercise.name,
                  category_id: newExercise.category_id,
                  calories_per_hour: newExercise.calories_per_hour,
                  owner: 'bybd',
                  public: false,
                },
              ],
            };
          }
          return category;
        })
      );
      setNewExercise(null);
      handleCloseAddExerciseDialog();
    }
  };

  const handleEditCategory = () => {
    if (editingCategory) {
      setCategoryWithExercises(
        categoryWithExercises.map((category) =>
          category.category_id === editingCategory.category_id ? { ...editingCategory, exercises: category.exercises } : category
        )
      );
      handleCloseEditCategoryDialog();
    }
  };

  const handleEditExercise = () => {
    if (editingExercise) {
      setCategoryWithExercises(
        categoryWithExercises.map((category) => {
          if (category.category_id === editingExercise.category_id) {
            return {
              ...category,
              exercises: category.exercises.map((exercise) =>
                exercise.exercise_id === editingExercise.exercise_id ? editingExercise : exercise
              ),
            };
          }
          return category;
        })
      );
      handleCloseEditExerciseDialog();
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategoryWithExercises(categoryWithExercises.filter((category) => category.category_id !== categoryId));
  };

  const handleDeleteExercise = (exerciseId: string, categoryId: string) => {
    setCategoryWithExercises(
      categoryWithExercises.map((category) => {
        if (category.category_id === categoryId) {
          return {
            ...category,
            exercises: category.exercises.filter((exercise) => exercise.exercise_id !== exerciseId),
          };
        }
        return category;
      })
    );
  };

  const handleBackToHome = () => {
    navigate('/homepage');
  };

  const handleIcon = (icon: string) => {
    switch (icon) {
      case 'Dumbbell':
        return <DumbbellIcon />;
      case 'Ball':
        return <BallIcon />;
      case 'Heart':
        return <HeartIcon />;
      case 'Basketball':
        return <BasketballIcon />;
      case 'Tennis':
        return <TennisIcon />;
      case 'Fight':
        return <FightIcon />;
      case 'Martial':
        return <MartialIcon />;
      case 'Mma':
        return <MmaIcon />;
      case 'Motorsports':
        return <MotorsportsIcon />;
      case 'Hiking':
        return <HikingIcon />;
      case 'Sailing':
        return <SailingIcon />;
      case 'Skiing':
        return <SkiingIcon />;
      case 'Pool':
        return <PoolIcon />;
      case 'Skate':
        return <SkateIcon />;
      case 'Rugby':
        return <RugbyIcon />;
      case 'Volleyball':
        return <VolleyballIcon />;
      default:
        return null;
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1a202c, #2d3748)', color: 'white', p: 4 }}>
      <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
          <IconButton component="a" sx={{ color: 'white' }} onClick={handleBackToHome}>
            <ArrowLeftIcon />
          </IconButton>
        <Typography variant="h4">Categories & Exercises</Typography>
        <Box sx={{ width: 6 }}></Box>
      </Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      ) : (
      <Card sx={{ backgroundColor: '#333', color: '#fff', height: 'calc(100vh - 200px)' }}>
        <CardHeader
          title="Categories"
          action={
            <IconButton aria-label="add" onClick={handleOpenAddCategoryDialog}>
              <PlusIcon sx={{ color: grey[50], fontSize: 25 }}/>
              <div>
                <p className='p-1 text-white text-lg'>Add New Category</p>
              </div>
            </IconButton>
          }
        />
        <CardContent>
          <Box sx={{ height: 'calc(100vh - 300px)', overflowY: 'auto' }}>
            {categoryWithExercises.map((category) => (
              <Accordion key={category.category_id} sx={{ backgroundColor: grey[800], color: 'white' }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                  aria-controls={`panel-${category.category_id}-content`}
                  id={`panel-${category.category_id}-header`}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {handleIcon(category.icon)}
                    <Typography sx={{ ml: 1, fontWeight: 'bold', fontSize: '1.2rem' }}>{category.name}</Typography>
                  </Box>
                  {category.isCustom && (
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                      <IconButton size="small" color="inherit" onClick={() => handleOpenEditCategoryDialog(category)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="inherit" onClick={() => handleDeleteCategory(category.category_id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ pl: 4 }}>
                    {category.exercises.map((exercise) => (
                      <Box key={exercise.exercise_id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography>{exercise.name}</Typography>
                        {!exercise.public && (
                          <Box>
                            <IconButton size="small" color="inherit" onClick={() => handleOpenEditExerciseDialog(exercise)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" color="inherit" onClick={() => handleDeleteExercise(exercise.exercise_id, category.category_id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    ))}
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PlusIcon />}
                      sx={{ mt: 2 }}
                      onClick={() => handleOpenAddExerciseDialog(category.category_id)}
                    >
                      Add Custom Exercise
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </CardContent>
      </Card>
      )}

      {/* Add Category Dialog */}
      <Dialog open={addCategoryDialogOpen} onClose={handleCloseAddCategoryDialog} fullWidth={true} maxWidth={'xs'} 
        PaperProps={{
          sx: {
            backgroundColor: grey[800],
            color: '#fff',
            borderRadius: '8px',
            padding: 2,
          },
        }}>
        <DialogTitle sx={{ color: '#fff', textAlign: 'center' }}>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="category-name"
            label="Name"
            InputLabelProps={{
              style: { color: '#b0b0b0' },
            }}
            type="text"
            fullWidth
            variant="standard"
            value={newCategory?.name || ''}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value, icon: newCategory?.icon || '' })}
            sx={{ mb: 3 }}
          />
          <FormControl fullWidth margin="dense">
          <InputLabel id="icon-label">Icon</InputLabel>
              <Select
                labelId="icon-label"
                id="icon"
                label="Icon"
                value={newCategory?.icon || ''}
                onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value, name: newCategory?.name || '' })}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      /* display: 'flex',
                      flexWrap: 'wrap',
                      maxWidth: 300,
                      padding: 1, */
                      backgroundColor: '#444',
                      color: '#fff',
                    },
                  },
                }}
              >
              <MenuItem value="">
                <em>Select an icon</em>
              </MenuItem>
                <MenuItem value="Dumbbell"><DumbbellIcon/></MenuItem>
                <MenuItem value="Ball"><BallIcon/></MenuItem>
                <MenuItem value="Heart"><HeartIcon/></MenuItem>
                <MenuItem value="Basketball"><BasketballIcon/></MenuItem>
                <MenuItem value="Tennis"><TennisIcon/></MenuItem>
                <MenuItem value="Fight"><FightIcon/></MenuItem>
                <MenuItem value="Martial"><MartialIcon/></MenuItem>
                <MenuItem value="Mma"><MmaIcon/></MenuItem>
                <MenuItem value="Motorsports"><MotorsportsIcon/></MenuItem>
                <MenuItem value="Hiking"><HikingIcon/></MenuItem>
                <MenuItem value="Sailing"><SailingIcon/></MenuItem>
                <MenuItem value="Skiing"><SkiingIcon/></MenuItem>
                <MenuItem value="Pool"><PoolIcon/></MenuItem>
                <MenuItem value="Skate"><SkateIcon/></MenuItem>
                <MenuItem value="Rugby"><RugbyIcon/></MenuItem>
                <MenuItem value="Volleyball"><VolleyballIcon/></MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddCategoryDialog}>Cancel</Button>
          <Button onClick={handleAddCategory}>Add Category</Button>
        </DialogActions>
      </Dialog>

      {/* Add Exercise Dialog */}
      <Dialog open={addExerciseDialogOpen} onClose={handleCloseAddExerciseDialog} fullWidth={true} maxWidth={'xs'}>
        <DialogTitle>Add New Exercise</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="exercise-name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            value={newExercise?.name || ''}
            onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value, calories_per_hour: newExercise?.calories_per_hour || 0, category_id: newExercise?.category_id || '' })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddExerciseDialog}>Cancel</Button>
          <Button onClick={handleAddExercise}>Add Exercise</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={editCategoryDialogOpen} onClose={handleCloseEditCategoryDialog} fullWidth={true} maxWidth={'xs'}>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          {editingCategory && (
            <TextField
              autoFocus
              margin="dense"
              id="edit-category-name"
              label="Name"
              type="text"
              fullWidth
              variant="standard"
              value={editingCategory.name}
              onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditCategoryDialog}>Cancel</Button>
          <Button onClick={handleEditCategory}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Exercise Dialog */}
      <Dialog open={editExerciseDialogOpen} onClose={handleCloseEditExerciseDialog}>
        <DialogTitle>Edit Exercise</DialogTitle>
        <DialogContent>
          {editingExercise && (
            <TextField
              autoFocus
              margin="dense"
              id="edit-exercise-name"
              label="Name"
              type="text"
              fullWidth
              variant="standard"
              value={editingExercise.name}
              onChange={(e) => setEditingExercise({ ...editingExercise, name: e.target.value })}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditExerciseDialog}>Cancel</Button>
          <Button onClick={handleEditExercise}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}