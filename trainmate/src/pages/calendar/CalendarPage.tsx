import React, { useState, useEffect } from 'react';
import { Button, Drawer, DatePicker, List, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es'; // Para manejar los textos en español
import locale from 'antd/es/date-picker/locale/es_ES'; // Para traducir los DatePickers
import { IconButton } from '@mui/material';
import { grey } from '@mui/material/colors';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { getWorkouts } from '../../api/WorkoutsApi'; // Asegúrate de importar la función de tu API

const { RangePicker } = DatePicker;

const CalendarModal = () => {
  const [visible, setVisible] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]); // Workouts que vienen del backend
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([dayjs(), dayjs()]); // Asegúrate de que tenga dos elementos
  const [loading, setLoading] = useState(false); // Para mostrar un indicador de carga

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const handleDateChange = async (dates: any) => {
    if (dates) {
      const [start, end] = dates;
      setDateRange([start, end]);
      setLoading(true); // Muestra un indicador de carga mientras se hace la llamada

      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token no encontrado');
        // Asegúrate de tener el token disponible
        const workouts = await getWorkouts(
          token,
          start ? dayjs(start).format('YYYY-MM-DD') : undefined,
          end ? dayjs(end).format('YYYY-MM-DD') : undefined
        ); // Obtiene los workouts filtrados por el rango de fechas
        const filteredEvents = workouts.map((workout: any) => ({
          name: workout.exercise,
          date: workout.date,
          duration: workout.duration,
        }));
        setSelectedEvents(filteredEvents); // Actualiza los eventos seleccionados con los workouts
      } catch (error) {
        console.error('Error fetching workouts:', error);
        setSelectedEvents([]); // Si hay error, limpia la lista
      } finally {
        setLoading(false); // Oculta el indicador de carga
      }
    } else {
      setSelectedEvents([]);
    }
  };

  useEffect(() => {
    // Si no se seleccionó ningún rango, usamos la fecha de hoy como predeterminado.
    if (!dateRange[0] || !dateRange[1]) {
      handleDateChange([dayjs(), dayjs()]);
    }
  }, [visible]);

  return (
    <>
      <IconButton aria-label="add" onClick={showDrawer}>
        <CalendarMonthIcon sx={{ color: grey[50], fontSize: 40 }} className="h-24 w-24" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p className='p-3 text-white'>Add New</p>
        </div>
      </IconButton>

      <Drawer
        title="Eventos Seleccionados"
        placement="right"
        onClose={onClose}
        visible={visible}
        width={400}
      >
        <RangePicker
          locale={locale}
          onChange={handleDateChange}
          format="DD-MM-YYYY"
          style={{ marginBottom: 20 }}
          value={dateRange}
        />

        {loading ? (
          <Typography.Text>Cargando eventos...</Typography.Text>
        ) : (
          <List
            dataSource={selectedEvents}
            renderItem={(item: any) => (
              <List.Item>
                <Typography.Text>{`${item.name} - ${dayjs(item.date).format('DD-MM-YYYY')} - ${item.duration} min`}</Typography.Text>
              </List.Item>
            )}
          />
        )}

        {selectedEvents.length === 0 && !loading && (
          <Typography.Text type="secondary">No hay eventos para el rango seleccionado.</Typography.Text>
        )}
      </Drawer>
    </>
  );
};

export default CalendarModal;
