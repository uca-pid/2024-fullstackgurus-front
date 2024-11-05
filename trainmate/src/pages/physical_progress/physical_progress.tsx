import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Box, Typography, IconButton, TextField, Button, Card, CardContent, CardHeader } from '@mui/material';
import { ArrowBack as ArrowLeftIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getPhysicalData, savePhysicalData } from '../../api/PhysicalDataApi';
import LoadingAnimation from '../../personalizedComponents/loadingAnimation';
import LoadingButton from '../../personalizedComponents/buttons/LoadingButton';
import TopMiddleAlert from '../../personalizedComponents/TopMiddleAlert';
import { renderCustomizedLabel } from './customizedLabel';

interface PhysicalData {
  date: string;
  weight: number;
  body_fat: number;
  body_muscle: number;
}

interface PhysicalDataForChart {
  date: string;
  Weight: number;
  BodyFat: number;
  BodyMuscle: number;
}

export default function PhysicalProgressPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<PhysicalData[]>([]);
  const [selectedDay, setSelectedDay] = useState<PhysicalDataForChart | null>(null);
  const [weight, setWeight] = useState<string>('');
  const [bodyFat, setBodyFat] = useState<string>('');
  const [bodyMuscle, setBodyMuscle] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState<boolean>(false)
  const [alertDataAddedOpen, setAlertDataAddedOpen] = useState(false)
  const [alertFillFieldsOpen, setAlertFillFieldsOpen] = useState(false)
  const [physicalDataCount, setPhysicalDataCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedData = await getPhysicalData();
        setData(fetchedData);
        // Cargo el último día por defecto
        setSelectedDay({
          date: formatDate(fetchedData[fetchedData.length - 1].date),
          Weight: fetchedData[fetchedData.length - 1].weight,
          BodyFat: fetchedData[fetchedData.length - 1].body_fat,
          BodyMuscle: fetchedData[fetchedData.length - 1].body_muscle
        });

      } catch (error) {
        console.error('Error al obtener datos físicos:', error);
      } finally{
        setLoading(false);
      }
    };
    fetchData();
  }, [physicalDataCount]);

  const handleBackToHome = () => {
    navigate('/homepage');
  };

  const handleLineClick = (day: PhysicalDataForChart) => {
    setSelectedDay(day);
  };

  const handleSave = async () => {
    // Validar y convertir los datos ingresados a números antes de guardar
    const parsedWeight = parseFloat(weight);
    const parsedBodyFat = parseFloat(bodyFat);
    const parsedBodyMuscle = parseFloat(bodyMuscle);
    
    if (isNaN(parsedWeight) || isNaN(parsedBodyFat) || isNaN(parsedBodyMuscle)) {
      setAlertFillFieldsOpen(true)
      return;
    }

    try {
      setLoadingButton(true)
      await savePhysicalData({ 
        date: date, 
        weight: parsedWeight, 
        body_fat: parsedBodyFat, 
        body_muscle: parsedBodyMuscle 
      });
      console.log('Datos físicos guardados correctamente');
      setLoadingButton(false)
      setAlertDataAddedOpen(true)
      setPhysicalDataCount(physicalDataCount + 1)
      setBodyFat('');
      setBodyMuscle('');
      setWeight('');
      setDate(new Date().toISOString().split('T')[0]);
  } catch (error) {
    console.error('Error al guardar datos físicos:', error);
    setLoadingButton(false)
  } finally {
    setLoadingButton(false)
  }
  };

  // Datos para el gráfico de tortas basado en el día seleccionado
  const pieData = selectedDay
    ? [
        { name: 'Body Muscle', value: parseFloat((selectedDay.BodyMuscle * 100 / selectedDay.Weight).toFixed(1)) },
        { name: 'Body Fat', value: parseFloat((selectedDay.BodyFat * 100 / selectedDay.Weight).toFixed(1)) },
        { name: 'Other', value: parseFloat(((selectedDay.Weight - selectedDay.BodyFat - selectedDay.BodyMuscle) * 100 / selectedDay.Weight).toFixed(1)) }
      ]
    : [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };
  
  const formatDataForChart = () => {
    return data
      .map((entry) => ({
        date: formatDate(entry.date),
        timestamp: new Date(entry.date).getTime(),
        Weight: entry.weight,
        BodyFat: entry.body_fat,
        BodyMuscle: entry.body_muscle,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  const dataForChart = useMemo(() => formatDataForChart(), [data]);

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'black', color: 'white', p: 4 }}  >
      <Box component="header" sx={{ display: 'flex', justifyContent: 'space-between', mb: 6 }}>
        <div className="flex items-center">
          <IconButton component="a" sx={{ color: 'white' }} onClick={handleBackToHome}>
            <ArrowLeftIcon />
          </IconButton>
            <img src={require('../../images/logo.png')} alt="Logo" width={200} height={150} className="hidden md:block"/>
        </div>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.3rem', sm: '1.8rem', md: '2.5rem' }, position: 'absolute', left: '50%', transform: 'translateX(-50%)'}}>Physical Progress</Typography>
      </Box>

      <TopMiddleAlert alertText='Added new entry successfully' open={alertDataAddedOpen} onClose={() => setAlertDataAddedOpen(false)} severity='success'/>
      <TopMiddleAlert alertText='Please fill in all the fields' open={alertFillFieldsOpen} onClose={() => setAlertFillFieldsOpen(false)} severity='warning'/>

      {loading ? (
        <LoadingAnimation />
      ) : (
        <Box sx={{ display: 'flex', gap: 4 }}>
          {/* Gráfico de Líneas */}
          <Card sx={{ flex: 2, backgroundColor: '#161616', color: '#fff'}} className='border border-gray-600'>
            <CardHeader
              title="Weight progress"
            />
            <CardContent>
              <ResponsiveContainer width="90%" height={640}>
                <LineChart width={500} height={400} data={dataForChart} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                 onClick={(e) => e.activePayload && handleLineClick(e.activePayload[0].payload)}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="date" stroke="#fff" tick={{ dy: 13 }}/>
                  <YAxis stroke="white" tick={{ fontWeight: 'bold' }}/>
                  <Tooltip contentStyle={{ backgroundColor: 'black', borderRadius: '5px' }} labelStyle={{ color: 'white' }}/>
                  <Legend verticalAlign="top" height={50} wrapperStyle={{marginLeft: 30}}/>
                  <Line type="monotone" dataKey="Weight" stroke="#0088FE" activeDot={{ r: 10 }} />
                  <Line type="monotone" dataKey="BodyMuscle" stroke="#44f814" activeDot={{ r: 10 }}/>
                  <Line type="monotone" dataKey="BodyFat" stroke="#E43654" activeDot={{ r: 10 }}/>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Gráfico de Tortas */}
            <Card sx={{backgroundColor: '#161616', color: '#fff', p: 2, height: 400 }} className='border border-gray-600'>
              <CardHeader
                title="Percentage of weight"
              />
              <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', position: 'relative', mt: -6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                  <PieChart width={400} height={280}>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={renderCustomizedLabel} stroke="#0088FE" strokeWidth={2} labelLine={false}>
                      <Cell key={`cell-0`} fill={"#44f814"}/>
                      <Cell key={`cell-1`} fill={"#E43654"}/>
                      <Cell key={`cell-2`} fill={"#81d8d0"}/>
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'black', borderRadius: '5px' }} labelStyle={{ color: 'white' }} itemStyle={{ color: '#fff' }}/>
                    <Legend verticalAlign="top" height={50} wrapperStyle={{marginTop: 5}}/>
                  </PieChart>
                </Box>
                <Typography variant="h6" sx={{ position: 'absolute', right: 25, top: '50%', transform: 'translateY(-50%)', color: '#fff' }}>{selectedDay?.date}</Typography>
              </CardContent>
            </Card>

            {/* Formulario */}
            <Card sx={{backgroundColor: '#161616', color: '#fff', p: 2, height: 440 }} className='border border-gray-600'>
              <CardHeader
                title="New entry"
              />
              <CardContent>
                <TextField
                  label="Date"
                  type="date"
                  margin="dense"
                  fullWidth
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{
                    style: { color: '#fff' }, // Color del label (Date)
                  }}
                  InputProps={{
                    style: { color: '#fff' }, // Color del texto dentro del input
                  }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#fff',
                    },
                  }}
                />
                <TextField
                  label="Weight (kg)"
                  type="number"
                  margin="dense"
                  fullWidth
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  InputLabelProps={{
                    style: { color: '#fff' }, // Color del label (Duration)
                  }}
                  InputProps={{
                    style: { color: '#fff' }, // Color del texto dentro del input
                  }}
                  slotProps={{
                    htmlInput: { min: 1, max: 1000 }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#fff', // Color del borde
                    },
                  }}
                />
                <TextField
                  label="Body Fat (kg)"
                  type="number"
                  margin="dense"
                  fullWidth
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  InputLabelProps={{
                    style: { color: '#fff' }, // Color del label (Duration)
                  }}
                  InputProps={{
                    style: { color: '#fff' }, // Color del texto dentro del input
                  }}
                  slotProps={{
                    htmlInput: { min: 1, max: 1000 }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#fff', // Color del borde
                    },
                  }}
                />
                <TextField
                  label="Body Muscle (kg)"
                  type="number"
                  margin="dense"
                  fullWidth
                  value={bodyMuscle}
                  onChange={(e) => setBodyMuscle(e.target.value)}
                  InputLabelProps={{
                    style: { color: '#fff' }, // Color del label (Duration)
                  }}
                  InputProps={{
                    style: { color: '#fff' }, // Color del texto dentro del input
                  }}
                  slotProps={{
                    htmlInput: { min: 1, max: 1000 }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#fff', // Color del borde
                    },
                  }}
                />
                <Box sx={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1}}>
                  <LoadingButton
                    isLoading={loadingButton}
                    onClick={handleSave}
                    label="SAVE DATA"
                    icon={<></>}
                    borderColor="border-transparent"
                    borderWidth="border"
                    bgColor="bg-transparent"
                    color="text-white"
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
    </Box>
  );
}