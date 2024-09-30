import React, { useState } from 'react';
import { Button, Card, CardContent, CardHeader, Typography, TextField, InputLabel, Box, Accordion, AccordionSummary, AccordionDetails, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, MenuItem, Select, FormControl,} from '@mui/material';
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

type Activity = {
    id: string;
    name: string;
    isCustom: boolean;
    categoryId: string;
  };

type Category = {
  id: string;
  name: string;
  icon: React.ReactNode;
  activities: Activity[];
  isCustom: boolean;
};

export default function CategoriesPage() {

    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([
        {
          id: '1',
          name: 'Strength',
          icon: <DumbbellIcon />,
          activities: [
            { id: '1', name: 'Weightlifting', isCustom: false, categoryId: '1' },
            { id: '2', name: 'Dumbbell Exercises', isCustom: false, categoryId: '1' },
          ],
          isCustom: false,
        },
        {
          id: '2',
          name: 'Sports',
          icon: <BallIcon />,
          activities: [
            { id: '3', name: 'Football', isCustom: false, categoryId: '2' },
            { id: '4', name: 'Tennis', isCustom: false, categoryId: '2' },
          ],
          isCustom: false,
        },
        {
          id: '3',
          name: 'Cardio',
          icon: <HeartIcon />,
          activities: [
            { id: '5', name: 'Running', isCustom: false, categoryId: '3' },
            { id: '6', name: 'Cycling', isCustom: false, categoryId: '3' },
          ],
          isCustom: false,
        },
      ]);

  const [newCategory, setNewCategory] = useState({ name: '', icon: '' });
  const [newActivity, setNewActivity] = useState({ name: '', categoryId: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [addActivityDialogOpen, setAddActivityDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [editActivityDialogOpen, setEditActivityDialogOpen] = useState(false);

  const handleOpenAddCategoryDialog = () => setAddCategoryDialogOpen(true);
  const handleCloseAddCategoryDialog = () => setAddCategoryDialogOpen(false);

  const handleOpenAddActivityDialog = (categoryId: string) => {
    setNewActivity({ ...newActivity, categoryId });
    setAddActivityDialogOpen(true);
  };
  const handleCloseAddActivityDialog = () => {
    setAddActivityDialogOpen(false);
    setNewActivity({ name: '', categoryId: '' });
  };

  const handleOpenEditCategoryDialog = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryDialogOpen(true);
  };
  const handleCloseEditCategoryDialog = () => {
    setEditCategoryDialogOpen(false);
    setEditingCategory(null);
  };

  const handleOpenEditActivityDialog = (activity: Activity) => {
    setEditingActivity(activity);
    setEditActivityDialogOpen(true);
  };
  const handleCloseEditActivityDialog = () => {
    setEditActivityDialogOpen(false);
    setEditingActivity(null);
  };

  const handleAddCategory = () => {
    if (newCategory.name && newCategory.icon) {
      const iconComponent = () => {
        switch (newCategory.icon) {
          case 'Dumbbell':
            return <DumbbellIcon />;
          case 'Ball':
            return <BallIcon />;
          case 'Heart':
            return <HeartIcon />;
          default:
            return <DumbbellIcon />;
        }
      };

      setCategories([
        ...categories,
        {
          id: Date.now().toString(),
          name: newCategory.name,
          icon: iconComponent(),
          activities: [],
          isCustom: true,
        },
      ]);
      setNewCategory({ name: '', icon: '' });
      handleCloseAddCategoryDialog();
    }
  };

  const handleAddActivity = () => {
    if (newActivity.name && newActivity.categoryId) {
      setCategories(
        categories.map((category) => {
          if (category.id === newActivity.categoryId) {
            return {
              ...category,
              activities: [
                ...category.activities,
                {
                  id: Date.now().toString(),
                  name: newActivity.name,
                  isCustom: true,
                  categoryId: newActivity.categoryId,
                },
              ],
            };
          }
          return category;
        })
      );
      setNewActivity({ name: '', categoryId: '' });
      handleCloseAddActivityDialog();
    }
  };

  const handleEditCategory = () => {
    if (editingCategory) {
      setCategories(
        categories.map((category) =>
          category.id === editingCategory.id ? editingCategory : category
        )
      );
      handleCloseEditCategoryDialog();
    }
  };

  const handleEditActivity = () => {
    if (editingActivity) {
      setCategories(
        categories.map((category) => {
          if (category.id === editingActivity.categoryId) {
            return {
              ...category,
              activities: category.activities.map((activity) =>
                activity.id === editingActivity.id ? editingActivity : activity
              ),
            };
          }
          return category;
        })
      );
      handleCloseEditActivityDialog();
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(categories.filter((category) => category.id !== categoryId));
  };

  const handleDeleteActivity = (activityId: string, categoryId: string) => {
    setCategories(
      categories.map((category) => {
        if (category.id === categoryId) {
          return {
            ...category,
            activities: category.activities.filter((activity) => activity.id !== activityId),
          };
        }
        return category;
      })
    );
  };

  const handleBackToHome = () => {
    navigate('/homepage');
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1a202c, #2d3748)', color: 'white', p: 4 }}>
      <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
          <IconButton component="a" sx={{ color: 'white' }} onClick={handleBackToHome}>
            <ArrowLeftIcon />
          </IconButton>
        <Typography variant="h4">Categories & Activities</Typography>
        <Box sx={{ width: 6 }}></Box>
      </Box>

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
            {categories.map((category) => (
              <Accordion key={category.id} sx={{ backgroundColor: grey[800], color: 'white' }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                  aria-controls={`panel-${category.id}-content`}
                  id={`panel-${category.id}-header`}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {category.icon}
                    <Typography sx={{ ml: 1, fontWeight: 'bold', fontSize: '1.2rem' }}>{category.name}</Typography>
                  </Box>
                  {category.isCustom && (
                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
                      <IconButton size="small" color="inherit" onClick={() => handleOpenEditCategoryDialog(category)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="inherit" onClick={() => handleDeleteCategory(category.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ pl: 4 }}>
                    {category.activities.map((activity) => (
                      <Box key={activity.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography>{activity.name}</Typography>
                        {activity.isCustom && (
                          <Box>
                            <IconButton size="small" color="inherit" onClick={() => handleOpenEditActivityDialog(activity)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small" color="inherit" onClick={() => handleDeleteActivity(activity.id, category.id)}>
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
                      onClick={() => handleOpenAddActivityDialog(category.id)}
                    >
                      Add Custom Activity
                    </Button>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </CardContent>
      </Card>

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
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            sx={{ mb: 3 }}
          />
          <FormControl fullWidth margin="dense">
          <InputLabel id="icon-label">Icon</InputLabel>
              <Select
                labelId="icon-label"
                id="icon"
                label="Icon"
                value={newCategory.icon}
                onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
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

      {/* Add Activity Dialog */}
      <Dialog open={addActivityDialogOpen} onClose={handleCloseAddActivityDialog} fullWidth={true} maxWidth={'xs'}>
        <DialogTitle>Add New Activity</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="activity-name"
            label="Name"
            type="text"
            fullWidth
            variant="standard"
            value={newActivity.name}
            onChange={(e) => setNewActivity({ ...newActivity, name: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddActivityDialog}>Cancel</Button>
          <Button onClick={handleAddActivity}>Add Activity</Button>
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

      {/* Edit Activity Dialog */}
      <Dialog open={editActivityDialogOpen} onClose={handleCloseEditActivityDialog}>
        <DialogTitle>Edit Activity</DialogTitle>
        <DialogContent>
          {editingActivity && (
            <TextField
              autoFocus
              margin="dense"
              id="edit-activity-name"
              label="Name"
              type="text"
              fullWidth
              variant="standard"
              value={editingActivity.name}
              onChange={(e) => setEditingActivity({ ...editingActivity, name: e.target.value })}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditActivityDialog}>Cancel</Button>
          <Button onClick={handleEditActivity}>Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}