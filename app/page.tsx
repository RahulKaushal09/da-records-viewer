"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';

const SUPABASE_URL = "https://bohjzhkisbixnhkqgflz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvaGp6aGtpc2JpeG5oa3FnZmx6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTAyMDUyNiwiZXhwIjoyMDgwNTk2NTI2fQ.NwmiBK52BS5ETQ-_4LUSK6priGNEZTzEwzKIKeq1U2g";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function DARecordsViewer() {
  const [records, setRecords] = useState<any[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [searchTerm, records]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('da_records')
        .select('*');
      console.log('Fetched records:', data);
      if (fetchError) throw fetchError;
      
      setRecords(data || []);
      setFilteredRecords(data || []);
    } catch (err) {
      setError((err as any).message);
      console.error('Error fetching records:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    if (!searchTerm.trim()) {
      setFilteredRecords(records);
      setCurrentPage(1);
      return;
    }

    const filtered = records.filter(record => {
      const searchLower = searchTerm.toLowerCase();
      return Object.values(record).some(value => 
        value?.toString().toLowerCase().includes(searchLower)
      );
    });

    setFilteredRecords(filtered);
    setCurrentPage(1);
  };

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Get all column names dynamically
  const columns = records.length > 0 ? Object.keys(records[0]) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 text-lg">Loading DA Records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Error Loading Data</h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={fetchRecords}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">DA Records Database</h1>
              <p className="text-gray-600">
                Total Records: <span className="font-semibold text-indigo-600">{records.length}</span>
                {searchTerm && (
                  <span className="ml-2">
                    | Filtered: <span className="font-semibold text-indigo-600">{filteredRecords.length}</span>
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={fetchRecords}
              className="flex items-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search across all fields..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      {column.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRecords.length > 0 ? (
                  currentRecords.map((record, idx) => (
                    <tr
                      key={record.id || idx}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {columns.map((column) => (
                        <td
                          key={column}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                        >
                          {record[column] !== null && record[column] !== undefined
                            ? record[column].toString()
                            : '-'}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No records found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstRecord + 1} to{' '}
                {Math.min(indexOfLastRecord, filteredRecords.length)} of{' '}
                {filteredRecords.length} records
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = idx + 1;
                  } else if (currentPage <= 3) {
                    pageNum = idx + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + idx;
                  } else {
                    pageNum = currentPage - 2 + idx;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}