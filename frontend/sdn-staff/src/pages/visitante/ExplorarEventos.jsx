import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../config/axios';
import { useAuth } from '../../auth/AuthContext';

const ExplorarEventos = () => {
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    search: '',
    tipo_evento: '',
    estado: '',
    fecha_desde: '',
    fecha_hasta: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [tiposEvento, setTiposEvento] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });

  useEffect(() => {
    cargarTiposEvento();
  }, []);

  useEffect(() => {
    cargarEventos();
  }, [pagination.currentPage, filtros.search, filtros.tipo_evento, filtros.estado, filtros.fecha_desde, filtros.fecha_hasta]);

  const cargarTiposEvento = async () => {
    try {
      const response = await axios.get('/tiposEvento');
      setTiposEvento(response.data.data || []);
    } catch (error) {
      console.error('Error cargando tipos de evento:', error);
    }
  };

  const cargarEventos = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filtros
      };

      const response = await axios.get('/eventos', { params });
      const eventos = response.data.data;
      const paginationData = response.data.pagination;
      
      setEventos(eventos || []);
      setPagination(prev => ({
        ...prev,
        totalPages: paginationData.totalPages,
        totalItems: paginationData.totalItems
      }));
    } catch (error) {
      console.error('Error cargando eventos:', error);
      setError('Error al cargar los eventos');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      setFiltros(prev => ({ ...prev, search: searchTerm }));
      setPagination(prev => ({ ...prev, currentPage: 1 }));
    }
  };

  const handlePageChange = (nuevaPagina) => {
    setPagination(prev => ({ ...prev, currentPage: nuevaPagina }));
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
          <p className="mt-4 text-gray-600">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Explorar Eventos</h1>
              <p className="mt-2 text-gray-600">Descubre eventos increíbles y guárdalos en tus favoritos</p>
            </div>
            {/* Botón 'Mis Favoritos' eliminado */}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Búsqueda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nombre del evento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => {
                    setFiltros(prev => ({ ...prev, search: searchTerm }));
                    setPagination(prev => ({ ...prev, currentPage: 1 }));
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Tipo de evento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de evento</label>
              <select
                value={filtros.tipo_evento}
                onChange={(e) => handleFiltroChange('tipo_evento', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Todos los tipos</option>
                {tiposEvento.map(tipo => (
                  <option key={tipo.id_tipo_evento} value={tipo.id_tipo_evento}>
                    {tipo.nombre_tipo}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filtros.estado}
                onChange={(e) => handleFiltroChange('estado', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="publicado">Publicado</option>
                <option value="borrador">Borrador</option>
              </select>
            </div>

            {/* Fecha desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
              <input
                type="date"
                value={filtros.fecha_desde}
                onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Fecha hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
              <input
                type="date"
                value={filtros.fecha_hasta}
                onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Grid de eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {eventos.map((evento) => {
            const estado = obtenerEstadoEvento(evento);
            return (
              <div key={evento.id_evento} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Imagen del evento */}
                <div className="h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center relative">
                  {evento.imagen_logo ? (
                    <img
                      src={evento.imagen_logo}
                      alt={evento.nombre_evento}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white text-center">
                      <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm opacity-75">Sin imagen</p>
                    </div>
                  )}
                  {/* Estado del evento */}
                  <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full ${estado.color}`}>
                    {estado.texto}
                  </span>
                </div>

                {/* Información del evento */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {evento.nombre_evento}
                  </h3>
                  
                  {evento.descripcion && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {evento.descripcion}
                    </p>
                  )}

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatearFecha(evento.fecha_inicio)}
                    </div>
                    
                    {evento.ubicacion && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {evento.ubicacion}
                      </div>
                    )}

                    {evento.tipoEvento && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {evento.tipoEvento.nombre_tipo}
                      </div>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className="mt-4 flex space-x-2">
                    <Link
                      to={`/visitante/eventos/${evento.id_evento}`}
                      className="flex-1 bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Ver Detalles
                    </Link>
                    {/* Botón Guardar (puedes eliminarlo si no lo necesitas) */}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Paginación */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === pagination.currentPage
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </nav>
          </div>
        )}

        {/* Sin eventos */}
        {eventos.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron eventos</h3>
            <p className="text-gray-600">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorarEventos; 