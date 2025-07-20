import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../config/axios';
import { useAuth } from '../../auth/AuthContext';

const DetalleEvento = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [esFavorito, setEsFavorito] = useState(false);

  useEffect(() => {
    cargarEvento();
  }, [id]);

  const cargarEvento = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/eventos/${id}`);
      setEvento(response.data.data);
    } catch (error) {
      console.error('Error cargando evento:', error);
      setError('Error al cargar el evento');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorito = async () => {
    try {
      if (esFavorito) {
        await axios.delete(`/visitante/eventos/${id}/favorito`);
        setEsFavorito(false);
      } else {
        await axios.post(`/visitante/eventos/${id}/favorito`);
        setEsFavorito(true);
      }
    } catch (error) {
      console.error('Error al cambiar favorito:', error);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obtenerEstadoEvento = (evento) => {
    const ahora = new Date();
    const fechaInicio = new Date(evento.fecha_inicio);
    const fechaFin = new Date(evento.fecha_fin);

    if (fechaInicio > ahora) return { texto: 'Próximo', color: 'bg-blue-100 text-blue-800' };
    if (fechaFin < ahora) return { texto: 'Finalizado', color: 'bg-gray-100 text-gray-800' };
    return { texto: 'Activo', color: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar el evento</h3>
          <p className="text-gray-600 mb-4">{error || 'Evento no encontrado'}</p>
          <Link
            to="/visitante/eventos"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Volver a Eventos
          </Link>
        </div>
      </div>
    );
  }

  const estado = obtenerEstadoEvento(evento);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/visitante/eventos"
                className="text-indigo-600 hover:text-indigo-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{evento.nombre_evento}</h1>
                <p className="mt-1 text-gray-600">Detalles del evento</p>
              </div>
            </div>
            <button
              onClick={toggleFavorito}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md transition-colors ${
                esFavorito
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill={esFavorito ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {esFavorito ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información principal */}
          <div className="lg:col-span-2">
            {/* Imagen del evento */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg h-64 mb-6 flex items-center justify-center">
              {evento.imagen_logo ? (
                <img
                  src={evento.imagen_logo}
                  alt={evento.nombre_evento}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-white text-center">
                  <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg opacity-75">Sin imagen</p>
                </div>
              )}
            </div>

            {/* Descripción */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Descripción</h2>
              <p className="text-gray-700 leading-relaxed">
                {evento.descripcion || 'No hay descripción disponible para este evento.'}
              </p>
            </div>

            {/* Información adicional */}
            {evento.configuracion_especifica && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Adicional</h2>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded">
                    {evento.configuracion_especifica}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar con información del evento */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Evento</h2>
              
              {/* Estado */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${estado.color}`}>
                  {estado.texto}
                </span>
              </div>

              {/* Fechas */}
              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Fecha de Inicio</h3>
                  <p className="text-gray-900">{formatearFecha(evento.fecha_inicio)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Fecha de Fin</h3>
                  <p className="text-gray-900">{formatearFecha(evento.fecha_fin)}</p>
                </div>
              </div>

              {/* Ubicación */}
              {evento.ubicacion && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Ubicación</h3>
                  <p className="text-gray-900">{evento.ubicacion}</p>
                </div>
              )}

              {/* URL Virtual */}
              {evento.url_virtual && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">URL Virtual</h3>
                  <a
                    href={evento.url_virtual}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 break-all"
                  >
                    {evento.url_virtual}
                  </a>
                </div>
              )}

              {/* Capacidad */}
              {evento.capacidad_maxima && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Capacidad Máxima</h3>
                  <p className="text-gray-900">{evento.capacidad_maxima} personas</p>
                </div>
              )}

              {/* Precio */}
              {evento.precio_entrada && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Precio de Entrada</h3>
                  <p className="text-gray-900">
                    {evento.moneda || 'PEN'} {parseFloat(evento.precio_entrada).toFixed(2)}
                  </p>
                </div>
              )}

              {/* Fecha límite de registro */}
              {evento.fecha_limite_registro && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Fecha Límite de Registro</h3>
                  <p className="text-gray-900">{formatearFecha(evento.fecha_limite_registro)}</p>
                </div>
              )}

              {/* Requiere aprobación */}
              {evento.requiere_aprobacion && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Registro</h3>
                  <p className="text-gray-900">Requiere aprobación</p>
                </div>
              )}

              {/* URL amigable */}
              {evento.url_amigable && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">URL Amigable</h3>
                  <p className="text-gray-900 font-mono text-sm">{evento.url_amigable}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetalleEvento; 