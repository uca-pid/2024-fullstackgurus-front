import { useState } from 'react';
import { Avatar, Button, Card, CardContent, CardHeader, Typography, TextField } from '@mui/material';
import { ArrowLeft, Edit2, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserInfo() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: '********',
    sex: 'Male',
    birthday: '1990-01-01',
    height: 180,
    weight: 75
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Aquí normalmente enviarías los datos del usuario actualizados a tu backend
    console.log('Saving user data:', user);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #1f2937, #111827)', color: 'white', padding: '16px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Link to="/home" style={{ color: 'white', textDecoration: 'none' }}>
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <Typography variant="h4" component="h1">User Profile</Typography>
        <div style={{ width: '24px' }}></div>
      </header>

      <Card style={{ backgroundColor: '#374151', color: 'white' }}>
        <CardHeader
          avatar={
            <Avatar alt="User" src="/placeholder-user.jpg" style={{ width: '80px', height: '80px' }} />
          }
          title={<Typography variant="h5">{user.name}</Typography>}
        />
        <CardContent>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextField
              label="Name"
              name="name"
              value={user.name}
              onChange={handleChange}
              disabled={!isEditing}
              //color="success"
              slotProps={{
                input: {
                  sx: {
                    color: 'white',
                  },
                },
                inputLabel: {
                sx: {
                    color: 'white',
                    },
                }
              }}
              sx={{
                '.MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'white', // Cambia el color del borde del TextField
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'green', // Color del borde al estar enfocado
                  },
                },
              }}
            />
            <TextField
              label="Email"
              value={user.email}
              disabled
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={user.password}
              onChange={handleChange}
              disabled={!isEditing}
            />
            <TextField
              label="Sex"
              value={user.sex}
              disabled
            />
            <TextField
              label="Birthday"
              value={user.birthday}
              disabled
            />
            <TextField
              label="Height (cm)"
              name="height"
              type="number"
              value={user.height}
              onChange={handleChange}
              disabled={!isEditing}
            />
            <TextField
              label="Weight (kg)"
              name="weight"
              type="number"
              value={user.weight}
              onChange={handleChange}
              disabled={!isEditing}
            />

            {isEditing ? (
              <Button variant="contained" onClick={handleSave} fullWidth>
                <Save style={{ marginRight: '8px' }} /> Save Changes
              </Button>
            ) : (
              <Button variant="contained" onClick={handleEdit} fullWidth>
                <Edit2 style={{ marginRight: '8px' }} /> Edit Profile
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}