import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, ArrowTrendingUpIcon, MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline';
import axios from '../../config/axios';

const MisFavoritos = () => {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    totalFavoritos: 0,
    recientes7Dias: 0
  });

  useEffect(() => {
    cargarFavoritos();
  }, []);

  const cargarFavoritos = async () => {
    try {
      setLoading(true);
      setDeleteError(null); // Limpiar error de borrado al cargar
      const response = await axios.get('/visitante/favoritos');
      setFavoritos(response.data.data || []);
      // Calcular estadísticas
      const stats = {
        totalFavoritos: response.data.data?.length || 0,
        recientes7Dias: response.data.data?.filter(f => {
          const fecha = new Date(f.fecha_agregado);
          const hace7Dias = new Date();
          hace7Dias.setDate(hace7Dias.getDate() - 7);
          return fecha >= hace7Dias;
        })?.length || 0
      };
      setEstadisticas(stats);
    } catch (error) {
      console.error('Error al cargar favoritos:', error);
      setError('Error al cargar los favoritos');
    } finally {
      setLoading(false);
    }
  };

  const eliminarFavorito = async (idEvento) => {
    try {
      setDeleteError(null);
      await axios.delete(`/visitante/eventos/${idEvento}/favorito`);
      setFavoritos(prev => prev.filter(f => f.id_evento !== idEvento));
      cargarFavoritos(); // Recargar estadísticas
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
      let mensaje = 'Error al eliminar el favorito';
      if (error.response && error.response.data && error.response.data.error) {
        mensaje = error.response.data.error;
      }
      setDeleteError(mensaje);
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'alta': return 'text-red-600 bg-red-100';
      case 'media': return 'text-yellow-600 bg-yellow-100';
      case 'baja': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
            <p className="text-gray-600 mt-2">Eventos que has guardado como favoritos</p>
          </div>
          <Link
            to="/visitante/explorar-eventos"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
            Explorar Eventos
          </Link>
        </div>

        {/* Estadísticas (solo dos bloques) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center">
              <HeartIcon className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Favoritos</p>
                <p className="text-2xl font-bold text-blue-900">{estadisticas.totalFavoritos}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Recientes (7 días)</p>
                <p className="text-2xl font-bold text-purple-900">{estadisticas.recientes7Dias}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback visual de error al eliminar */}
        {deleteError && (
          <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded">
            {deleteError}
          </div>
        )}

        {/* Lista de favoritos */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        ) : favoritos.length === 0 ? (
          <div className="text-center py-12">
            <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No tienes favoritos</p>
            <Link
              to="/visitante/explorar-eventos"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
              Explorar Eventos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoritos.map((favorito) => (
              <div key={favorito.id_evento_favorito} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {favorito.evento?.nombre_evento || 'Evento no disponible'}
                    </h3>
                    {/* Botón de eliminar eliminado */}
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <strong>Fecha:</strong> {formatearFecha(favorito.evento?.fecha_inicio)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Ubicación:</strong> {favorito.evento?.ubicacion || 'No especificada'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Agregado:</strong> {formatearFecha(favorito.fecha_agregado)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrioridadColor(favorito.prioridad)}`}>
                      {favorito.prioridad}
                    </span>
                  </div>

                  {favorito.notas_personales && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-700">{favorito.notas_personales}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisFavoritos; 