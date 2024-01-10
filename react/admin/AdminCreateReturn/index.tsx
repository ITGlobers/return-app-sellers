import React, { useState } from 'react'
import {
  Layout,
  PageHeader,
  Table,
  Input,
  Dropdown,
  Button,
  Pagination,
  Tag,
  Box,
} from 'vtex.styleguide'
import faker from 'faker'

const StatusTag = ({ status }) => {
  const color = status === 'Pendiente' ? 'warning' : 'success'

  return (
    <Tag
      type={color}
      style={{
        justifyContent: 'center',
        display: 'flex',
      }}
    >
      {status}
    </Tag>
  )
}

const orderTableSchema = {
  properties: {
    status: {
      title: 'Status',
      width: 150,
      // eslint-disable-next-line react/display-name
      cellRenderer: ({ rowData }) => <StatusTag status={rowData.status} />,
    },
    orderId: {
      title: 'Order ID',
      minWidth: 200,
    },
    createdDate: {
      title: 'Created Date',
      minWidth: 100,
    },
    customer: {
      title: 'Customer',
      minWidth: 200,
    },
    quantity: {
      title: 'Qty.',
      minWidth: 100,
    },
    totalAmount: {
      title: 'Total Amount',
      minWidth: 150,
    },
    origin: {
      title: 'Origin',
      minWidth: 100,
    },
    payment: {
      title: 'Payment',
      minWidth: 150,
    },
  },
}

const generateFakeOrders = (numOrders) =>
  Array.from({ length: numOrders }, () => ({
    status: faker.random.arrayElement([
      'Enviado',
      'Pendiente',
      'Procesando',
      'Cancelado',
    ]),
    orderId: faker.random.uuid(),
    createdDate: faker.date.past().toLocaleDateString(),
    customer: faker.name.findName(),
    quantity: faker.random.number({ min: 1, max: 5 }),
    totalAmount: `$${faker.commerce.price()}`,
    origin: faker.random.arrayElement(['Online', 'Tienda']),
    payment: faker.random.arrayElement([
      'Tarjeta de Crédito',
      'Efectivo',
      'Transferencia',
    ]),
  }))

const pedidosEjemplo = generateFakeOrders(50)

export const AdminCreateReturn = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredOrders, setFilteredOrders] = useState(pedidosEjemplo)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 10

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: 'Enviado', label: 'Enviado' },
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Procesando', label: 'Procesando' },
    { value: 'Cancelado', label: 'Cancelado' },
  ]

  const handleSearchChange = (e) => {
    const { value } = e.target

    setSearchTerm(value)
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    applyFilters(value, filterStatus, filterDate)
  }

  const handleStatusChange = (e) => {
    const { value } = e.target

    setFilterStatus(value)
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    applyFilters(searchTerm, value, filterDate)
  }

  const handleDateChange = (e) => {
    const { value } = e.target

    setFilterDate(value)
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    applyFilters(searchTerm, filterStatus, value)
  }

  const applyFilters = (searchValue, statusValue, dateValue) => {
    const filtered = pedidosEjemplo.filter(
      (order) =>
        (statusValue ? order.status === statusValue : true) &&
        (dateValue ? order.createdDate === dateValue : true) &&
        (searchValue
          ? Object.values(order).some((val) =>
              String(val).toLowerCase().includes(searchValue.toLowerCase())
            )
          : true)
    )

    setFilteredOrders(filtered)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFilterStatus('')
    setFilterDate('')
    setFilteredOrders(pedidosEjemplo)
  }

  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  )

  const handlePaginationChange = (newPage) => setCurrentPage(newPage)

  const currentItemFrom = indexOfFirstOrder + 1
  const currentItemTo = indexOfLastOrder > filteredOrders.length

  filteredOrders.length
  indexOfLastOrder

  return (
    <Layout
      fullWidth
      style={{
        padding: '0',
        minWidth: '100%',
      }}
    >
      <PageHeader
        title="Orders"
        subtitle="All return requests created by store users. Click a request ID to see more."
      />
      <Box
        style={{
          backgroundColor: '#f3f4f6',
          borderRadius: '4px',
          padding: '16px',
          maxWidth: '64rem',
        }}
      >
        <div className="mb5">
          <div className="flex flex-row mb5">
            <div className="mr5">
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="mr5">
              <Dropdown
                placeholder="Estado del pedido"
                options={statusOptions}
                value={filterStatus}
                onChange={handleStatusChange}
              />
            </div>
            <div className="mr5">
              <Input
                type="date"
                placeholder="Fecha de Creación"
                value={filterDate}
                onChange={handleDateChange}
              />
            </div>
            <Button variation="secondary" onClick={clearFilters}>
              Limpiar
            </Button>
          </div>
          <Table
            fullWidth
            schema={orderTableSchema}
            items={currentOrders}
            density="high"
            onRowClick={() => null}
          />
        </div>
        <Pagination
          totalItems={filteredOrders.length}
          itemsPerPage={ordersPerPage}
          currentPage={currentPage}
          onPageChange={handlePaginationChange}
          textOf="de"
          currentItemFrom={currentItemFrom}
          currentItemTo={currentItemTo}
        />
      </Box>
    </Layout>
  )
}
