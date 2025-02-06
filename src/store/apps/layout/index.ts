// ** Redux Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ** Axios Imports
import axios from 'axios'

// ** Types
import { CalendarFiltersType, AddEventType, EventType } from 'src/types/apps/calendarTypes'

export const setHiddenNavbar = createAsyncThunk(
  'layout/setHiddenNavbar',
  async (data: boolean, { dispatch }) => {
    dispatch(() => data)

    return data
  }
)

// ** Fetch Events
export const fetchEvents = createAsyncThunk(
  'appCalendar/fetchEvents',
  async (calendars: CalendarFiltersType[]) => {
    const response = await axios.get('/apps/calendar/events', {
      params: {
        calendars
      }
    })

    return response.data
  }
)

// ** Add Event
export const addEvent = createAsyncThunk(
  'appCalendar/addEvent',
  async (event: AddEventType, { dispatch }) => {
    const response = await axios.post('/apps/calendar/add-event', {
      data: {
        event
      }
    })
    await dispatch(fetchEvents(['Personal', 'Business', 'Family', 'Holiday', 'ETC']))

    return response.data.event
  }
)

// ** Update Event
export const updateEvent = createAsyncThunk(
  'appCalendar/updateEvent',
  async (event: EventType, { dispatch }) => {
    const response = await axios.post('/apps/calendar/update-event', {
      data: {
        event
      }
    })
    await dispatch(fetchEvents(['Personal', 'Business', 'Family', 'Holiday', 'ETC']))

    return response.data.event
  }
)

// ** Delete Event
export const deleteEvent = createAsyncThunk(
  'appCalendar/deleteEvent',
  async (id: number | string, { dispatch }) => {
    const response = await axios.delete('/apps/calendar/remove-event', {
      params: { id }
    })
    await dispatch(fetchEvents(['Personal', 'Business', 'Family', 'Holiday', 'ETC']))

    return response.data
  }
)

export const layoutSlice = createSlice({
  name: 'layout',
  initialState: {
    hiddenNavbar: { sm: false, navbar: true }
  },
  reducers: {
    handleSetLayout: (state, action) => {
      state.hiddenNavbar = action.payload
    }
  }
})
export const { handleSetLayout } = layoutSlice.actions

export default layoutSlice.reducer
