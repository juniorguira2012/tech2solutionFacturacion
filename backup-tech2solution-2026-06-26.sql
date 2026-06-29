--
-- PostgreSQL database dump
--

\restrict Rksl4kfMpNqILxMg8MeqX9tl6V6CEIy87u9hAa6AnoGIUoddiRtbjWg4gKnKFb3

-- Dumped from database version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.14 (Ubuntu 16.14-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: inventory_counts_estado_enum; Type: TYPE; Schema: public; Owner: tech2_admin
--

CREATE TYPE public.inventory_counts_estado_enum AS ENUM (
    'EN_PROGRESO',
    'Ajustes Publicados',
    'CANCELADO'
);


ALTER TYPE public.inventory_counts_estado_enum OWNER TO tech2_admin;

--
-- Name: product_serials_status_enum; Type: TYPE; Schema: public; Owner: tech2_admin
--

CREATE TYPE public.product_serials_status_enum AS ENUM (
    'disponible',
    'vendido',
    'en_reparacion',
    'descartado',
    'en_comodato',
    'asignado_tecnico'
);


ALTER TYPE public.product_serials_status_enum OWNER TO tech2_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    accion character varying NOT NULL,
    "entidadId" character varying NOT NULL,
    "entidadTipo" character varying NOT NULL,
    "usuarioId" character varying NOT NULL,
    detalles jsonb,
    fecha timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO tech2_admin;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: tech2_admin
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO tech2_admin;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tech2_admin
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    descripcion text
);


ALTER TABLE public.categories OWNER TO tech2_admin;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: tech2_admin
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO tech2_admin;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tech2_admin
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.clients (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    rnc character varying,
    telefono character varying,
    email character varying,
    direccion character varying,
    zona character varying,
    categoria character varying DEFAULT 'Bronce'::character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.clients OWNER TO tech2_admin;

--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: tech2_admin
--

CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clients_id_seq OWNER TO tech2_admin;

--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tech2_admin
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: comodato_products; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.comodato_products (
    comodato_id integer NOT NULL,
    product_id integer NOT NULL
);


ALTER TABLE public.comodato_products OWNER TO tech2_admin;

--
-- Name: comodatos; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.comodatos (
    id integer NOT NULL,
    "productoId" integer NOT NULL,
    responsable character varying NOT NULL,
    nota text,
    "fechaEntrega" timestamp without time zone,
    "fechaLimite" timestamp without time zone,
    "fechaDevolucion" timestamp without time zone,
    "usuarioId" integer,
    estado character varying DEFAULT 'activo'::character varying NOT NULL,
    "fechaCreacion" timestamp without time zone DEFAULT now() NOT NULL,
    "fechaActualizacion" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.comodatos OWNER TO tech2_admin;

--
-- Name: comodatos_id_seq; Type: SEQUENCE; Schema: public; Owner: tech2_admin
--

CREATE SEQUENCE public.comodatos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comodatos_id_seq OWNER TO tech2_admin;

--
-- Name: comodatos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tech2_admin
--

ALTER SEQUENCE public.comodatos_id_seq OWNED BY public.comodatos.id;


--
-- Name: count_items; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.count_items (
    id integer NOT NULL,
    "productoId" integer NOT NULL,
    "productoNombre" character varying NOT NULL,
    codigo character varying,
    "cantidadSistema" integer NOT NULL,
    "cantidadContada" integer,
    "precioUnitario" numeric(10,2) NOT NULL,
    "unidadMedida" character varying NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "conteoId" integer
);


ALTER TABLE public.count_items OWNER TO tech2_admin;

--
-- Name: count_items_id_seq; Type: SEQUENCE; Schema: public; Owner: tech2_admin
--

CREATE SEQUENCE public.count_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.count_items_id_seq OWNER TO tech2_admin;

--
-- Name: count_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tech2_admin
--

ALTER SEQUENCE public.count_items_id_seq OWNED BY public.count_items.id;


--
-- Name: inventory_batches; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.inventory_batches (
    id integer NOT NULL,
    "productoId" integer NOT NULL,
    "numeroLote" character varying NOT NULL,
    cantidad numeric(10,2) NOT NULL,
    almacen character varying NOT NULL,
    "fechaVencimiento" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.inventory_batches OWNER TO tech2_admin;

--
-- Name: inventory_batches_id_seq; Type: SEQUENCE; Schema: public; Owner: tech2_admin
--

CREATE SEQUENCE public.inventory_batches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_batches_id_seq OWNER TO tech2_admin;

--
-- Name: inventory_batches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tech2_admin
--

ALTER SEQUENCE public.inventory_batches_id_seq OWNED BY public.inventory_batches.id;


--
-- Name: inventory_count_items; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.inventory_count_items (
    id integer NOT NULL,
    "productoId" integer NOT NULL,
    "productoNombre" character varying NOT NULL,
    codigo character varying NOT NULL,
    "cantidadContada" double precision DEFAULT '0'::double precision NOT NULL,
    "cantidadSistema" double precision DEFAULT '0'::double precision NOT NULL,
    "precioUnitario" double precision DEFAULT '0'::double precision NOT NULL,
    "unidadMedida" character varying DEFAULT 'Unidad'::character varying NOT NULL,
    diferencia double precision DEFAULT '0'::double precision NOT NULL,
    "costoVariacion" double precision DEFAULT '0'::double precision NOT NULL,
    "inventoryCountId" integer
);


ALTER TABLE public.inventory_count_items OWNER TO tech2_admin;

--
-- Name: inventory_count_items_id_seq; Type: SEQUENCE; Schema: public; Owner: tech2_admin
--

CREATE SEQUENCE public.inventory_count_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_count_items_id_seq OWNER TO tech2_admin;

--
-- Name: inventory_count_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tech2_admin
--

ALTER SEQUENCE public.inventory_count_items_id_seq OWNED BY public.inventory_count_items.id;


--
-- Name: inventory_counts; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.inventory_counts (
    id integer NOT NULL,
    almacen character varying NOT NULL,
    descripcion character varying,
    estado public.inventory_counts_estado_enum DEFAULT 'EN_PROGRESO'::public.inventory_counts_estado_enum NOT NULL,
    "totalProductos" integer DEFAULT 0 NOT NULL,
    "totalVariacion" double precision DEFAULT '0'::double precision NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.inventory_counts OWNER TO tech2_admin;

--
-- Name: inventory_counts_id_seq; Type: SEQUENCE; Schema: public; Owner: tech2_admin
--

CREATE SEQUENCE public.inventory_counts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_counts_id_seq OWNER TO tech2_admin;

--
-- Name: inventory_counts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tech2_admin
--

ALTER SEQUENCE public.inventory_counts_id_seq OWNED BY public.inventory_counts.id;


--
-- Name: movements; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.movements (
    id integer NOT NULL,
    "productoId" integer NOT NULL,
    tipo character varying NOT NULL,
    cantidad integer NOT NULL,
    nota character varying,
    "almacenOrigen" character varying,
    "almacenDestino" character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "nuevoStock" integer,
    "costoUnitario" numeric(10,2),
    referencia character varying,
    "technicianId" integer,
    "usuarioId" integer
);


ALTER TABLE public.movements OWNER TO tech2_admin;

--
-- Name: movements_id_seq; Type: SEQUENCE; Schema: public; Owner: tech2_admin
--

CREATE SEQUENCE public.movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movements_id_seq OWNER TO tech2_admin;

--
-- Name: movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tech2_admin
--

ALTER SEQUENCE public.movements_id_seq OWNED BY public.movements.id;


--
-- Name: product_serials; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.product_serials (
    id integer NOT NULL,
    "serialNumber" character varying(100) NOT NULL,
    "productoId" integer NOT NULL,
    status public.product_serials_status_enum DEFAULT 'disponible'::public.product_serials_status_enum NOT NULL,
    almacen character varying(100) NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    nota text,
    "lastReturnNote" text
);


ALTER TABLE public.product_serials OWNER TO tech2_admin;

--
-- Name: COLUMN product_serials.almacen; Type: COMMENT; Schema: public; Owner: tech2_admin
--

COMMENT ON COLUMN public.product_serials.almacen IS 'Almacén donde se encuentra físicamente el serial';


--
-- Name: COLUMN product_serials.nota; Type: COMMENT; Schema: public; Owner: tech2_admin
--

COMMENT ON COLUMN public.product_serials.nota IS 'Nota general o de entrega del serial';


--
-- Name: COLUMN product_serials."lastReturnNote"; Type: COMMENT; Schema: public; Owner: tech2_admin
--

COMMENT ON COLUMN public.product_serials."lastReturnNote" IS 'Última nota de devolución registrada por el técnico';


--
-- Name: product_serials_id_seq; Type: SEQUENCE; Schema: public; Owner: tech2_admin
--

CREATE SEQUENCE public.product_serials_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_serials_id_seq OWNER TO tech2_admin;

--
-- Name: product_serials_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tech2_admin
--

ALTER SEQUENCE public.product_serials_id_seq OWNED BY public.product_serials.id;


--
-- Name: product_warehouse_stock; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.product_warehouse_stock (
    id integer NOT NULL,
    "productoId" integer NOT NULL,
    almacen character varying NOT NULL,
    cantidad integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.product_warehouse_stock OWNER TO tech2_admin;

--
-- Name: product_warehouse_stock_id_seq; Type: SEQUENCE; Schema: public; Owner: tech2_admin
--

CREATE SEQUENCE public.product_warehouse_stock_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_warehouse_stock_id_seq OWNER TO tech2_admin;

--
-- Name: product_warehouse_stock_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tech2_admin
--

ALTER SEQUENCE public.product_warehouse_stock_id_seq OWNED BY public.product_warehouse_stock.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.products (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    codigo character varying,
    modelo character varying,
    serie character varying,
    categoria character varying DEFAULT 'General'::character varying NOT NULL,
    precio numeric(10,2) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    imagen text,
    almacen character varying DEFAULT 'Principal'::character varying,
    pasillo character varying,
    fila character varying,
    ubicacion character varying,
    "unidadMedida" character varying DEFAULT 'Unidad'::character varying,
    "movimientoInventario" character varying DEFAULT 'Entrada'::character varying,
    descripcion text,
    "camposPersonalizados" jsonb DEFAULT '[]'::jsonb,
    vendidos integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "proveedorId" integer,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "isSerialized" boolean DEFAULT false NOT NULL,
    "isComodato" boolean DEFAULT false NOT NULL,
    nota text
);


ALTER TABLE public.products OWNER TO tech2_admin;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: tech2_admin
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO tech2_admin;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tech2_admin
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: providers; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.providers (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    rnc character varying,
    telefono character varying,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    correo character varying,
    direccion character varying,
    ofrece character varying(255)
);


ALTER TABLE public.providers OWNER TO tech2_admin;

--
-- Name: providers_id_seq; Type: SEQUENCE; Schema: public; Owner: tech2_admin
--

CREATE SEQUENCE public.providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.providers_id_seq OWNER TO tech2_admin;

--
-- Name: providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tech2_admin
--

ALTER SEQUENCE public.providers_id_seq OWNED BY public.providers.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying NOT NULL,
    config jsonb DEFAULT '{}'::jsonb NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.roles OWNER TO tech2_admin;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: tech2_admin
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO tech2_admin;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tech2_admin
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.sale_items (
    id integer NOT NULL,
    "saleId" integer NOT NULL,
    "productoId" integer NOT NULL,
    cantidad integer NOT NULL,
    precio numeric(10,2) NOT NULL
);


ALTER TABLE public.sale_items OWNER TO tech2_admin;

--
-- Name: sale_items_id_seq; Type: SEQUENCE; Schema: public; Owner: tech2_admin
--

CREATE SEQUENCE public.sale_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_items_id_seq OWNER TO tech2_admin;

--
-- Name: sale_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tech2_admin
--

ALTER SEQUENCE public.sale_items_id_seq OWNED BY public.sale_items.id;


--
-- Name: sales; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    cliente character varying NOT NULL,
    rnc character varying,
    subtotal numeric(12,2) NOT NULL,
    descuento numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    itbis numeric(12,2) NOT NULL,
    total numeric(12,2) NOT NULL,
    "vendedorId" character varying,
    fecha timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sales OWNER TO tech2_admin;

--
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: tech2_admin
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_id_seq OWNER TO tech2_admin;

--
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tech2_admin
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- Name: technicians; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.technicians (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    telefono character varying,
    email character varying,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.technicians OWNER TO tech2_admin;

--
-- Name: technicians_id_seq; Type: SEQUENCE; Schema: public; Owner: tech2_admin
--

CREATE SEQUENCE public.technicians_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.technicians_id_seq OWNER TO tech2_admin;

--
-- Name: technicians_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tech2_admin
--

ALTER SEQUENCE public.technicians_id_seq OWNED BY public.technicians.id;


--
-- Name: unidades_medida; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.unidades_medida (
    id integer NOT NULL,
    codigo character varying NOT NULL,
    nombre character varying NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


ALTER TABLE public.unidades_medida OWNER TO tech2_admin;

--
-- Name: unidades_medida_id_seq; Type: SEQUENCE; Schema: public; Owner: tech2_admin
--

CREATE SEQUENCE public.unidades_medida_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.unidades_medida_id_seq OWNER TO tech2_admin;

--
-- Name: unidades_medida_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tech2_admin
--

ALTER SEQUENCE public.unidades_medida_id_seq OWNED BY public.unidades_medida.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.users (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    rol character varying DEFAULT 'user'::character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    "resetToken" character varying,
    "resetTokenExpiresAt" timestamp without time zone
);


ALTER TABLE public.users OWNER TO tech2_admin;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: tech2_admin
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO tech2_admin;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tech2_admin
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: tech2_admin
--

CREATE TABLE public.warehouses (
    id integer NOT NULL,
    nombre character varying NOT NULL,
    descripcion character varying,
    ubicaciones jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.warehouses OWNER TO tech2_admin;

--
-- Name: warehouses_id_seq; Type: SEQUENCE; Schema: public; Owner: tech2_admin
--

CREATE SEQUENCE public.warehouses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.warehouses_id_seq OWNER TO tech2_admin;

--
-- Name: warehouses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tech2_admin
--

ALTER SEQUENCE public.warehouses_id_seq OWNED BY public.warehouses.id;


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: comodatos id; Type: DEFAULT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.comodatos ALTER COLUMN id SET DEFAULT nextval('public.comodatos_id_seq'::regclass);


--
-- Name: count_items id; Type: DEFAULT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.count_items ALTER COLUMN id SET DEFAULT nextval('public.count_items_id_seq'::regclass);


--
-- Name: inventory_batches id; Type: DEFAULT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.inventory_batches ALTER COLUMN id SET DEFAULT nextval('public.inventory_batches_id_seq'::regclass);


--
-- Name: inventory_count_items id; Type: DEFAULT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.inventory_count_items ALTER COLUMN id SET DEFAULT nextval('public.inventory_count_items_id_seq'::regclass);


--
-- Name: inventory_counts id; Type: DEFAULT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.inventory_counts ALTER COLUMN id SET DEFAULT nextval('public.inventory_counts_id_seq'::regclass);


--
-- Name: movements id; Type: DEFAULT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.movements ALTER COLUMN id SET DEFAULT nextval('public.movements_id_seq'::regclass);


--
-- Name: product_serials id; Type: DEFAULT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.product_serials ALTER COLUMN id SET DEFAULT nextval('public.product_serials_id_seq'::regclass);


--
-- Name: product_warehouse_stock id; Type: DEFAULT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.product_warehouse_stock ALTER COLUMN id SET DEFAULT nextval('public.product_warehouse_stock_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: providers id; Type: DEFAULT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.providers ALTER COLUMN id SET DEFAULT nextval('public.providers_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: sale_items id; Type: DEFAULT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.sale_items ALTER COLUMN id SET DEFAULT nextval('public.sale_items_id_seq'::regclass);


--
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- Name: technicians id; Type: DEFAULT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.technicians ALTER COLUMN id SET DEFAULT nextval('public.technicians_id_seq'::regclass);


--
-- Name: unidades_medida id; Type: DEFAULT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.unidades_medida ALTER COLUMN id SET DEFAULT nextval('public.unidades_medida_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: warehouses id; Type: DEFAULT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.warehouses ALTER COLUMN id SET DEFAULT nextval('public.warehouses_id_seq'::regclass);


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.audit_logs (id, accion, "entidadId", "entidadTipo", "usuarioId", detalles, fecha) FROM stdin;
1	ELIMINAR_CONTEO_FISICO	4	InventoryCount	4	{"almacen": "Almacen Principal", "descripcion": "Auditoria Semanal", "fechaCreacion": "2026-05-23T21:30:57.563Z"}	2026-06-10 05:17:10.209925
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.categories (id, nombre, "createdAt", "updatedAt", descripcion) FROM stdin;
2	REDES	2026-06-24 10:30:03.215018	2026-06-24 11:18:38.096093	hola
1	FIBRA OPTICA	2026-06-23 18:38:47.207972	2026-06-24 11:19:51.194328	hilo flexible y transparente de vidrio o plástico
3	ELECTRONICA	2026-06-25 19:04:38.256816	2026-06-25 19:04:38.256816	
\.


--
-- Data for Name: clients; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.clients (id, nombre, rnc, telefono, email, direccion, zona, categoria, "isActive", "createdAt", "updatedAt") FROM stdin;
3	Pedro Martinez	0014578234	80945982343	pmaretinez@gmail.com	C/lebomnr#45	LOS Alcarrizos	Plata	f	2026-06-10 21:37:27.561967	2026-06-11 13:23:34.233761
4	Ernesto Cueva	22900467845	8096784567	ecueva@gmail.com	C/lebron #45	Los Alcarrizos	Bronce	t	2026-06-11 13:27:01.327909	2026-06-11 13:27:01.327909
2	Errique Cordero	1323413132132	9098800808	cenrrique@gmail.com	Calle, lebron #60	Los alcrrizos	Diamante	t	2026-06-10 20:49:58.633899	2026-06-11 13:27:43.509155
\.


--
-- Data for Name: comodato_products; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.comodato_products (comodato_id, product_id) FROM stdin;
\.


--
-- Data for Name: comodatos; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.comodatos (id, "productoId", responsable, nota, "fechaEntrega", "fechaLimite", "fechaDevolucion", "usuarioId", estado, "fechaCreacion", "fechaActualizacion") FROM stdin;
\.


--
-- Data for Name: count_items; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.count_items (id, "productoId", "productoNombre", codigo, "cantidadSistema", "cantidadContada", "precioUnitario", "unidadMedida", "createdAt", "updatedAt", "conteoId") FROM stdin;
1	10	FUENTE 12 V 1A	0000009	6	0	250.00	Unidad	2026-05-22 13:56:21.006389	2026-05-22 13:56:21.019403	\N
2	9	CABLE DE FIBRA OPTICA DROP 2 HILOS FTTH	FIB-SM2-DC	20	0	5000.00	Unidad	2026-05-22 13:56:21.043263	2026-05-22 13:56:21.051503	\N
3	8	SILLA DE ESCRITORIO	000007	44	0	2000.00	Unidad	2026-05-22 13:56:21.072587	2026-05-22 13:56:21.081015	\N
4	7	INTERNET WIFI	00005	384	0	1200.00	Unidad	2026-05-22 13:56:21.100894	2026-05-22 13:56:21.106909	\N
5	5	ROUTER	000006	18	0	1900.00	Unidad	2026-05-22 13:56:21.125303	2026-05-22 13:56:21.132377	\N
6	4	ZTE	0002	39	0	2457.00	Unidad	2026-05-22 13:56:21.149487	2026-05-22 13:56:21.15528	\N
7	2	BOTAS TOTAL	00003	17	0	2500.00	Caja	2026-05-22 13:56:21.174144	2026-05-22 13:56:21.183218	\N
8	10	FUENTE 12 V 1A	0000009	6	0	250.00	Unidad	2026-05-22 13:56:28.228493	2026-05-22 13:56:28.23736	\N
9	9	CABLE DE FIBRA OPTICA DROP 2 HILOS FTTH	FIB-SM2-DC	20	0	5000.00	Unidad	2026-05-22 13:56:28.25431	2026-05-22 13:56:28.262844	\N
10	8	SILLA DE ESCRITORIO	000007	44	0	2000.00	Unidad	2026-05-22 13:56:28.280073	2026-05-22 13:56:28.285999	\N
11	7	INTERNET WIFI	00005	384	0	1200.00	Unidad	2026-05-22 13:56:28.303558	2026-05-22 13:56:28.309523	\N
12	5	ROUTER	000006	18	0	1900.00	Unidad	2026-05-22 13:56:28.32581	2026-05-22 13:56:28.330419	\N
13	4	ZTE	0002	39	0	2457.00	Unidad	2026-05-22 13:56:28.344359	2026-05-22 13:56:28.348008	\N
14	2	BOTAS TOTAL	00003	17	0	2500.00	Caja	2026-05-22 13:56:28.36245	2026-05-22 13:56:28.368907	\N
15	10	FUENTE 12 V 1A	0000009	6	0	250.00	Unidad	2026-05-22 13:58:19.541623	2026-05-22 13:58:19.549525	\N
16	9	CABLE DE FIBRA OPTICA DROP 2 HILOS FTTH	FIB-SM2-DC	20	0	5000.00	Unidad	2026-05-22 13:58:19.566832	2026-05-22 13:58:19.574484	\N
17	8	SILLA DE ESCRITORIO	000007	44	0	2000.00	Unidad	2026-05-22 13:58:19.591426	2026-05-22 13:58:19.596553	\N
18	7	INTERNET WIFI	00005	384	0	1200.00	Unidad	2026-05-22 13:58:19.613024	2026-05-22 13:58:19.62016	\N
19	5	ROUTER	000006	18	0	1900.00	Unidad	2026-05-22 13:58:19.63888	2026-05-22 13:58:19.644569	\N
20	4	ZTE	0002	39	0	2457.00	Unidad	2026-05-22 13:58:19.662189	2026-05-22 13:58:19.667119	\N
21	2	BOTAS TOTAL	00003	17	0	2500.00	Caja	2026-05-22 13:58:19.68463	2026-05-22 13:58:19.69197	\N
22	10	FUENTE 12 V 1A	0000009	6	0	250.00	Unidad	2026-05-22 13:58:32.6325	2026-05-22 13:58:32.649947	\N
23	9	CABLE DE FIBRA OPTICA DROP 2 HILOS FTTH	FIB-SM2-DC	20	0	5000.00	Unidad	2026-05-22 13:58:32.667167	2026-05-22 13:58:32.673121	\N
24	8	SILLA DE ESCRITORIO	000007	44	0	2000.00	Unidad	2026-05-22 13:58:32.690117	2026-05-22 13:58:32.696052	\N
25	7	INTERNET WIFI	00005	384	0	1200.00	Unidad	2026-05-22 13:58:32.713511	2026-05-22 13:58:32.718957	\N
26	5	ROUTER	000006	18	0	1900.00	Unidad	2026-05-22 13:58:32.735344	2026-05-22 13:58:32.741823	\N
27	4	ZTE	0002	39	0	2457.00	Unidad	2026-05-22 13:58:32.757663	2026-05-22 13:58:32.764901	\N
28	2	BOTAS TOTAL	00003	17	0	2500.00	Caja	2026-05-22 13:58:32.78246	2026-05-22 13:58:32.787265	\N
29	11	CABLE UTP 5E 100% COBRE VELOGI	00000009	9	0	8000.00	Unidad	2026-05-22 13:58:58.578931	2026-05-22 13:58:58.590558	\N
30	10	FUENTE 12 V 1A	0000009	6	0	250.00	Unidad	2026-05-22 13:58:58.612923	2026-05-22 13:58:58.621367	\N
31	7	INTERNET WIFI	00005	384	0	1200.00	Unidad	2026-05-22 13:58:58.63933	2026-05-22 13:58:58.645167	\N
32	10	FUENTE 12 V 1A	0000009	6	0	250.00	Unidad	2026-05-22 17:12:44.100168	2026-05-22 17:12:44.115637	\N
33	9	CABLE DE FIBRA OPTICA DROP 2 HILOS FTTH	FIB-SM2-DC	20	0	5000.00	Unidad	2026-05-22 17:12:44.134723	2026-05-22 17:12:44.143055	\N
34	8	SILLA DE ESCRITORIO	000007	44	0	2000.00	Unidad	2026-05-22 17:12:44.163308	2026-05-22 17:12:44.170936	\N
35	7	INTERNET WIFI	00005	384	0	1200.00	Unidad	2026-05-22 17:12:44.193973	2026-05-22 17:12:44.201283	\N
36	5	ROUTER	000006	18	0	1900.00	Unidad	2026-05-22 17:12:44.218947	2026-05-22 17:12:44.226846	\N
37	4	ZTE	0002	39	0	2457.00	Unidad	2026-05-22 17:12:44.244703	2026-05-22 17:12:44.250846	\N
38	2	BOTAS TOTAL	00003	17	0	2500.00	Caja	2026-05-22 17:12:44.270618	2026-05-22 17:12:44.277945	\N
39	10	FUENTE 12 V 1A	0000009	6	0	250.00	Unidad	2026-05-23 17:31:10.954482	2026-05-23 17:31:10.967103	\N
40	9	CABLE DE FIBRA OPTICA DROP 2 HILOS FTTH	FIB-SM2-DC	20	0	5000.00	Unidad	2026-05-23 17:31:10.989945	2026-05-23 17:31:10.997322	\N
41	8	SILLA DE ESCRITORIO	000007	44	0	2000.00	Unidad	2026-05-23 17:31:11.01749	2026-05-23 17:31:11.023307	\N
42	7	INTERNET WIFI	00005	383	0	1200.00	Unidad	2026-05-23 17:31:11.041698	2026-05-23 17:31:11.049874	\N
43	5	ROUTER	000006	18	0	1900.00	Unidad	2026-05-23 17:31:11.068094	2026-05-23 17:31:11.074202	\N
44	4	ZTE	0002	39	0	2457.00	Unidad	2026-05-23 17:31:11.092184	2026-05-23 17:31:11.099689	\N
45	2	BOTAS TOTAL	00003	17	0	2500.00	Caja	2026-05-23 17:31:11.118491	2026-05-23 17:31:11.124224	\N
46	11	CABLE UTP 5E 100% COBRE VELOGI	00000009	8	0	8000.00	Unidad	2026-06-10 04:56:37.78245	2026-06-10 04:56:37.794592	\N
47	10	FUENTE 12 V 1A	0000009	6	0	250.00	Unidad	2026-06-10 04:56:37.822461	2026-06-10 04:56:37.833436	\N
48	9	CABLE DE FIBRA OPTICA DROP 2 HILOS FTTH	FIB-SM2-DC	19	0	5000.00	Unidad	2026-06-10 04:56:37.856409	2026-06-10 04:56:37.864276	\N
49	8	SILLA DE ESCRITORIO	000007	42	0	2000.00	Unidad	2026-06-10 04:56:37.887137	2026-06-10 04:56:37.896064	\N
50	7	INTERNET WIFI	00005	383	0	1200.00	Unidad	2026-06-10 04:56:37.92265	2026-06-10 04:56:37.929597	\N
51	4	ZTE	0002	39	0	2457.00	Unidad	2026-06-10 04:56:37.957199	2026-06-10 04:56:37.965459	\N
52	2	BOTAS TOTAL	00003	17	0	2500.00	Caja	2026-06-10 04:56:37.993406	2026-06-10 04:56:38.004469	\N
\.


--
-- Data for Name: inventory_batches; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.inventory_batches (id, "productoId", "numeroLote", cantidad, almacen, "fechaVencimiento", "createdAt", "updatedAt") FROM stdin;
10	20	LOTE-1782327255811-516	1.00	ALMACEN CALLE LEBRON	2027-06-24 14:54:15.811	2026-06-24 14:54:15.78464	2026-06-24 14:54:15.78464
11	20	LOTE-1782428760745-678	1.00	ALMACEN CALLE LEBRON	2027-06-25 19:06:00.745	2026-06-25 19:06:00.732076	2026-06-25 19:06:00.732076
\.


--
-- Data for Name: inventory_count_items; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.inventory_count_items (id, "productoId", "productoNombre", codigo, "cantidadContada", "cantidadSistema", "precioUnitario", "unidadMedida", diferencia, "costoVariacion", "inventoryCountId") FROM stdin;
\.


--
-- Data for Name: inventory_counts; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.inventory_counts (id, almacen, descripcion, estado, "totalProductos", "totalVariacion", "createdAt") FROM stdin;
5	Almacen Principal	Auditoria Semanal	Ajustes Publicados	0	0	2026-05-23 17:51:39.299474
6	ALMACEN CALLE LEBRON	Faltante de OLT	Ajustes Publicados	7	0	2026-06-10 04:56:12.225638
\.


--
-- Data for Name: movements; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.movements (id, "productoId", tipo, cantidad, nota, "almacenOrigen", "almacenDestino", "createdAt", "nuevoStock", "costoUnitario", referencia, "technicianId", "usuarioId") FROM stdin;
94	19	ASIGNACION_TECNICO	1	Asignado al técnico: Amauri | Serial: SN-0006	ALMACEN CALLE LEBRON	Móvil (Técnico)	2026-06-23 12:52:43.561506	5	\N	\N	2	3
95	19	DEVOLUCION	1	No se instalo	ALMACEN CALLE LEBRON	ALMACEN CALLE LEBRON	2026-06-23 12:53:50.907423	4	\N	\N	\N	3
96	19	DEVOLUCION	1		ALMACEN CALLE LEBRON	ALMACEN CALLE LEBRON	2026-06-23 12:56:29.928367	3	\N	\N	\N	3
97	19	DEVOLUCION	1		ALMACEN CALLE LEBRON	ALMACEN CALLE LEBRON	2026-06-23 12:58:21.510465	2	\N	\N	\N	3
98	19	DESPACHAR	1	Despacho de Inventario  - 23/6/2026 | Almacén: ALMACEN CALLE LEBRON	ALMACEN CALLE LEBRON	ALMACEN CALLE LEBRON	2026-06-23 15:25:10.169712	5	2499.98	\N	\N	3
99	19	DEVOLUCION	1	No funciono	ALMACEN CALLE LEBRON	ALMACEN CALLE LEBRON	2026-06-23 15:31:39.135734	4	\N	\N	\N	3
100	19	ASIGNACION_TECNICO	1	Asignado al técnico: Amauri | Serial: SN-0007	ALMACEN CALLE LEBRON	Móvil (Técnico)	2026-06-23 15:34:29.139646	4	\N	\N	2	3
101	19	DEVOLUCION_TECNICO	1	Devolución de técnico. Devolución manual desde módulo de técnicos	Móvil (Técnico)	ALMACEN CALLE LEBRON	2026-06-23 17:11:28.614136	5	\N	\N	\N	1
102	19	ASIGNACION_TECNICO	1	Asignado al técnico: Hernesto Cueva | Serial: SN-0007	ALMACEN CALLE LEBRON	Móvil (Técnico)	2026-06-23 17:18:14.260802	4	\N	\N	1	3
103	19	DEVOLUCION_TECNICO	1	Devolución de técnico. Devolución manual desde módulo de técnicos	Móvil (Técnico)	ALMACEN CALLE LEBRON	2026-06-23 17:19:49.357906	5	\N	\N	\N	1
104	19	ASIGNACION_TECNICO	1	Asignado al técnico: Amauri | Serial: SN-0004	ALMACEN CALLE LEBRON	Móvil (Técnico)	2026-06-23 18:13:39.896974	5	\N	\N	2	3
105	19	ASIGNACION_TECNICO	1	Asignado al técnico: Amauri | Serial: SN-0007	ALMACEN CALLE LEBRON	Móvil (Técnico)	2026-06-24 11:23:57.950382	4	\N	\N	2	3
106	20	RECIBIR	1	Recibo de Inventario (Prov: HTLVision) - 24/6/2026 | Lote: LOTE-1782327255811-516 | Almacén: ALMACEN CALLE LEBRON	ALMACEN CALLE LEBRON	ALMACEN CALLE LEBRON	2026-06-24 14:54:15.78464	11	688.00	\N	\N	3
107	19	RECIBIR	1	Recibo de Inventario (Prov: La Famosa) - 24/6/2026 | Almacén: ALMACEN CALLE LEBRON	ALMACEN CALLE LEBRON	ALMACEN CALLE LEBRON	2026-06-24 14:54:35.15288	5	2499.98	\N	\N	3
108	19	ASIGNACION_TECNICO	1	Asignado al técnico: Amauri | Serial: SN-0003	ALMACEN CALLE LEBRON	Móvil (Técnico)	2026-06-24 14:58:07.261931	4	\N	\N	2	3
109	19	ASIGNACION_TECNICO	1	Asignado al técnico: Amauri | Serial: SN-0005	ALMACEN CALLE LEBRON	Móvil (Técnico)	2026-06-24 15:19:33.242935	3	\N	\N	2	3
110	19	DEVOLUCION_TECNICO	1	Devolución de técnico. Devolución manual desde módulo de técnicos	Móvil (Técnico)	ALMACEN CALLE LEBRON	2026-06-24 16:53:44.050343	4	\N	\N	\N	1
111	19	ASIGNACION_TECNICO	1	Asignado al técnico: Hernesto Cueva | Serial: SN-0006	ALMACEN CALLE LEBRON	Móvil (Técnico)	2026-06-24 16:54:26.066098	3	\N	\N	1	3
112	19	DEVOLUCION_TECNICO	1	Devolución de técnico. Devolución manual desde módulo de técnicos	Móvil (Técnico)	ALMACEN CALLE LEBRON	2026-06-25 12:31:37.116866	4	\N	\N	\N	3
113	19	DESPACHAR	1	Venta realizada desde el POS	ALMACEN CALLE LEBRON	ALMACEN CALLE LEBRON	2026-06-25 13:00:19.881766	3	\N	\N	\N	\N
114	19	DEVOLUCION_TECNICO	1	Devolución de técnico. Equipo defectuoso	Móvil (Técnico)	ALMACEN CALLE LEBRON	2026-06-25 15:59:58.8297	5	\N	\N	\N	3
115	19	DEVOLUCION_TECNICO	1	Devolución de técnico. Potencia alta	Móvil (Técnico)	ALMACEN CALLE LEBRON	2026-06-25 16:08:36.86312	6	\N	\N	\N	3
116	19	DEVOLUCION_TECNICO	1	Devolución de técnico. No funciona	Móvil (Técnico)	ALMACEN CALLE LEBRON	2026-06-25 16:27:16.457957	7	\N	\N	\N	3
117	19	DEVOLUCION_TECNICO	1	Devolución de técnico. No funcionma	Móvil (Técnico)	ALMACEN CALLE LEBRON	2026-06-25 16:55:07.133006	8	\N	\N	\N	3
118	19	ASIGNACION_TECNICO	1	Asignado al técnico: Hernesto Cueva | Serial: SN-0002	ALMACEN CALLE LEBRON	Móvil (Técnico)	2026-06-25 16:57:56.360236	7	\N	\N	1	3
119	19	ASIGNACION_TECNICO	1	Asignado al técnico: Hernesto Cueva | Serial: SN-00010	ALMACEN CALLE LEBRON	Móvil (Técnico)	2026-06-25 16:57:56.360236	7	\N	\N	1	3
120	19	DEVOLUCION_TECNICO	1	Devolución de técnico. Devolución masiva desde módulo de técnicos	Móvil (Técnico)	ALMACEN CALLE LEBRON	2026-06-25 17:00:12.056045	7	\N	\N	\N	3
121	19	DEVOLUCION_TECNICO	1	Devolución de técnico. No funciono	Móvil (Técnico)	ALMACEN CALLE LEBRON	2026-06-25 17:35:45.287017	8	\N	\N	\N	3
122	20	DESPACHAR	1	Venta realizada desde el POS	ALMACEN CALLE LEBRON	ALMACEN CALLE LEBRON	2026-06-25 19:03:30.628432	10	\N	\N	\N	\N
123	20	RECIBIR	1	Recibo de Inventario (Prov: HTLVision) - 25/6/2026 | Lote: LOTE-1782428760745-678 | Almacén: ALMACEN CALLE LEBRON	ALMACEN CALLE LEBRON	ALMACEN CALLE LEBRON	2026-06-25 19:06:00.732076	11	688.00	\N	\N	8
124	20	DESPACHAR	1	Venta realizada desde el POS	ALMACEN CALLE LEBRON	ALMACEN CALLE LEBRON	2026-06-25 19:18:01.583384	10	\N	\N	\N	\N
\.


--
-- Data for Name: product_serials; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.product_serials (id, "serialNumber", "productoId", status, almacen, "createdAt", "updatedAt", nota, "lastReturnNote") FROM stdin;
14	SN-0001	19	vendido	ALMACEN CALLE LEBRON	2026-06-23 10:57:07.123295	2026-06-23 15:25:10.169712	\N	\N
35	SN-0008	19	disponible	ALMACEN CALLE LEBRON	2026-06-23 15:17:57.78337	2026-06-23 18:07:53.030789	\N	\N
29	SN-0003	19	disponible	ALMACEN CALLE LEBRON	2026-06-23 11:51:59.449037	2026-06-25 12:31:37.116866	\N	\N
31	SN-0005	19	disponible	ALMACEN CALLE LEBRON	2026-06-23 12:15:45.992621	2026-06-25 15:59:58.8297	\N	\N
34	SN-0006	19	disponible	ALMACEN CALLE LEBRON	2026-06-23 12:29:56.215375	2026-06-25 16:08:36.86312	\N	\N
30	SN-0004	19	disponible	ALMACEN CALLE LEBRON	2026-06-23 11:52:44.187887	2026-06-25 16:27:16.457957	\N	\N
36	SN-0007	19	disponible	ALMACEN CALLE LEBRON	2026-06-23 18:08:08.4988	2026-06-25 16:55:07.133006	\N	\N
15	SN-0002	19	disponible	ALMACEN CALLE LEBRON	2026-06-23 10:57:07.123295	2026-06-25 17:00:12.056045	\N	\N
37	SN-00010	19	disponible	ALMACEN CALLE LEBRON	2026-06-24 14:54:35.15288	2026-06-25 17:35:45.287017	\N	No funciono
\.


--
-- Data for Name: product_warehouse_stock; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.product_warehouse_stock (id, "productoId", almacen, cantidad) FROM stdin;
64	19	ALMACEN CALLE LEBRON	0
65	20	ALMACEN CALLE LEBRON	10
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.products (id, nombre, codigo, modelo, serie, categoria, precio, stock, imagen, almacen, pasillo, fila, ubicacion, "unidadMedida", "movimientoInventario", descripcion, "camposPersonalizados", vendidos, "isActive", "proveedorId", "createdAt", "updatedAt", "isSerialized", "isComodato", nota) FROM stdin;
20	PRUBA	000000002	NDA567	0000002345	REDES	688.00	10	data:image/jpeg;base64,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	ALMACEN CALLE LEBRON	TRAMO-1		TRAMO-1	Unidad	Entrada		[]	0	t	1	2026-06-24 13:28:02.627806	2026-06-25 19:18:01.583384	f	f	\N
19	ONT Huawei HG8145V5	10939283103	HG8145V5		FIBRA OPTICA	2499.98	8	data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEA2ADYAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAJYAlgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9U6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKTcPWgBaKbuHrS5oAWiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACoJHTu2Klk+7XO30zfbDHu+WgVzaVouzVMrL61zEMzrkljitCwuxcTKmcE0C5kbQpaYF245zTgaChaKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK5jXdcmtdbgsoyArx72Pcc0n2yf/nq1BPMjqKK5aPVriID5t3OOa6eNt0an1FA7jqKKKBhRRRQAUUUUAFFFFABRRRQAUUUUAMauWu33XEjd811EzbY2b0FclI25if7xoMpE0S7sL2JqrDc/Y/EFlFnAcsKuf6tc98VzOoXRj1q0mPWN8/rQZrc9NOaUU1WyoI6EZpy0HQLRRRQMKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigDzDxFqHmfEKVM8QwxoPxyf610CtuQGuB1q4/4ru/kzz5oX8q7i1bdBn2oOeXxA3b6119q263Q+1ckw6V02lSbrYUGsdi7RRRQWFFFFABRRRQAUUUUAFFFFABRRRQBU1OTy7OQ+1cwMEr6VqeM7z+z/D9zP/dH9a8lk+JiwrjbkgUHPPc9KnkG089q4/U3LXGR/Cax7f4jfbJAm3GavS3XnYc/xUCR61pVwLnTbaQHO6MZP4VcWuc8E3X2jRVQnmJitdElBuPooooKCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigApGbapNLUF9IIrOdz/CjH9KAPB76fzvElzJn705P616Np7eZagjpivKZJC108ncuT+tdBZ+OI7GIRORkUHNLc7084re0Vs29eYL8SLBV+YHP1rt/A/iCHXIbgw/djI/UUGkWdZRRRQahRRRQAUUUUAFFFFABRRRQAUUUUAYXjOx/tLw3fw9/LLD8Oa+WbxmjuHU9jX19cRiSJ0IyGUg/jXyl4ssTp/iC7hIxtlI/WgwnuQ6fJtljavRbdvPsY2HWvM7dioH+ya9D8NzfaLEL3FBKPQ/h/IVe5iJ+8A1dqnWvPvB03k6pGM4DqVNehR0GsR9FFFBoFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFACVkeKLr7NoN9JnH7sgfjWu3SuR+JFz5Hht0HWRwtBLPG5PlVjXHahcM105Brrr5tlux9q4i4bdOx96RySeoNISvWvoH4H2bQ+HLidv+WsmB+Ar57Vd0iD3r6i+GNj9j8G2K4wXBc/jTNI7nWr0paSloOkKKKKACiiigAooooAKKKKACiiigBD0r5w+L1h9j8XXDAYEmHFfSFeJfHew2ahaXIH3kwTQZVO55XF95vpXa+D58qVzzXEx/eH5V1HhKbbPtoMj0fR5vs+oW7Zxh69PjOea8lt2KuGHYg16pYy+baxP/eUGguL1LVFFFBuFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFADX6VwPxVm22NpF/ecmu+evMfipcB7y1hH8KZP40Gc9jzTVm22jVxTcyNXYeIG22uPWuO7mgwJrRd91EPevrfwxb/AGbw/YJjGIV/lXyn4ftjdaxbRjqXUfrX1zZR+TZwR/3UA/Sg1gupPRRRQbBRRRQAUUUUAFFFFABRRRQAUUUUAI3SvNvjhYefoMFwBkxvj869JNct8SbL7d4RuxjJUbhQTLVHzMvBH1rb8PzeXeD61isNrsPetDS5NtzGaDmPULdtyqfUV6V4Zm8/Sbc9cDFeYWL74ENeheCpt1m8Z/haguO50tFFFB0BRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAx68d+IN19o8RTAdIwFr2KQ4Ga8L8UzCXWbt/wDbNBjM47xPJiFBXLLXQeJJC2FPYZrn16UGR13wv0/+0PFlmpGQHz+VfUVfPnwNtfM8SeZjOxSa+hKDensFFFFBoFFFFABRRRQAUUUUAFFFFABSZpaT+IUALVDWrf7Zo93DjO6Nh+lX6Yy70dT3GKAPkfUITBfTJ/dYinWbbXQ+9aXjazNj4kvI8YAkNZEB2t+NByHpuiSeZZr9K7nwbdeXeMh6MK868Lzb7XGa7DQbj7PfQt05waB9Uz02imo25QfUU6g6gooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAgvH8u3kY8bVJ/SvBNWk8y6nb1cn9a9t8TXH2XRLp+nyEV4VdtnJ9TQYzOQ8QSbrplz2xWRtNXNSk82+lb3xVWgyPYfgHa/6Vdz46LjNe2V5l8D7H7P4flnI5kavTFoN4bDqKKKDQKKKKACiiigAooooAKKKKACiiigApKWigD55+M1iLXxY7KMLIoauIhHP4V6z8eLH99Y3XqpT8q8mjOMUHNLc7DwnNj5c12tmSsin0Ned+GJtt0BXoVqcmglnqWnyeZZxN1+WrFZfh2bztMj9uK1KDqWwUUUUDCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAOX+Ik/laA65xuOK8XvGxGTXrHxQm26dBH6tmvIdTfZbyn/AGTQYz3OKk+aVz7mlVMim/xGp4F3si+rAfrQZn0r8L7X7L4QsxjBYZNdctY3hG3+zeHbFMY/ditlaDdDqKKKCwooooAKKKKACiiigAooooAKKKKACiiigDz34zWP2rw2soXPkyZz9RXgY4r6b8fWYvPCt+hGSE3D8K+Z5U2sRQYT3NHRJfLvF+tem2LblU15ZYjy5kavStJnElpG1BmeieD5t1q8eehroq43wbcbbqSPP3hXZUHRD4QooooLCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKQnFAHmvxSut11DCDnaua8q12Xy7OT1PFd/8QLj7RrswzwvFeb+I2/chc96DCb1ObrW0G1+1alax4zukArMWMsK6v4fWf2vxNYx9fnz+VBmmfS9jGIbSBAMbUUfpVimR/Kop26g6kLRRRQMKKKKACiiigAooooAKKKKACiiigAooooAp6tALrT7iEjIeNl/SvlzVIDb6hJFjG1yP1r6tkXdgdq+avHVj9i8V30eMASE/nQZVDFVtuK7zw9L5lio7iuAZq7HwrPuTZ7UGJ6B4Ym8rUo/9qvQ68u0mXy7qJvQ16dC2+JG9RQa0+w+iiig2CiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKZK21Gb0GafVPV5vI025k/uoaBM8W8R3H2jVrmTPVjXC69JumC+1ddfyb5HbPU1xerNvvmpHJIpKuFFd78HbI3HiqJ8cRKWNcJ04r1f4F2268vJschMUCgtT2f8AhFC9aVfuilpnaFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABXg3xes/J8USSgcSID+Ne815H8abL99a3GOoK0ET2PJurKa6LwvMUvNh71zqdR7GtfR5PKvYj05oOc9FtW2sD6HNenaXL51jC3+zXlts3zD3Feh+FbjztP2Z5U0GlPc2qKKKDcKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKSgBaKbuo3UCHUUm6loGFFFFABRRRQAVheM7j7PoFwc4LcVu1x3xKuvL0mOL+81AnseVXbfuia4u6bfcse+a67UJNls30rjn+aakcchrfeNe2fAu126beS4+8wFeJtyxr6I+Etj9j8KxNjBkbNCNKZ29FFFM6QooooAKKKKACiiigAooooAKKKKACiiigAooooAQ1wXxes/tGgLKBkxuDXet0rn/HVp9s8M3iYyQm78qCZbHzdtwzVbtW2yRt6Gq8i4kIqSE/LQcx6RYSb4o29q7XwdcFZJI/UV5/ok2+zjOc12Pheby9QUZ4PFBUdzut3NOqNetSUHQhaKKRmCjJoGLRVSa+WL3qsdZUdv0oA1KKy/wC2l/u/pR/bS+n6UAalFZf9sr6fpR/bK+n6UAalFZf9sr6fpR/bS+n6UAalFZX9uJ6Uv9tL6UAalFZX9tp6Uv8AbSelAGpRWX/bS+lRtrg7D9KANikzWMNWaSnf2gfSgDXzRmsj+0D6Gj+0DQBr5ozWR/aB9DR/aBoA180ZrI/tA+ho/tGgDXzRuHrWR/aBpragx6A0AbG4etG4etYv25/Sk+3P2oA29w9aNw9axPt0lH26SgDb3D1o3D1rE+3SUfbZKANvcPWjcPWsT7dJR9ukoA29w9aN49axftknpQL2SgVzY8yk3e9ZP26T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0bna/wDhXJL4D8QtMY/7KuAc4yU4/OgxszLh5Fd/8J7H7VrrTFcrDGWz2z0qno/wl1y4kX7XGlrF/FlwTj8K9Y8LeE7TwvZtDbAs7nLyN1Pt9KClFmz707NLto20Gwq0tJS0FBRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUyn0m0UANptSbRSMtBLGU4cUm2n4oBDaVaXaKWgYUUUUDCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAGtTWp9G0UCIqUU/bRtoEJStS4ooGItOpKWgYUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUlLRQAm2loooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/9k=	ALMACEN CALLE LEBRON	TRAMO-1	F-1/C-1	TRAMO-1 - F-1/C-1	Unidad	Entrada		[]	0	t	2	2026-06-23 10:57:07.123295	2026-06-25 17:35:45.287017	t	f	\N
\.


--
-- Data for Name: providers; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.providers (id, nombre, rnc, telefono, "createdAt", correo, direccion, ofrece) FROM stdin;
2	La Famosa	000012	809456223	2026-05-21 14:03:18.69201	famosa@@gmail.com	Av, Churchil numero 50	Material gastable
1	HTLVision	9001467	8096783456	2026-05-20 20:36:39.757285	htlvision@gmasil.com	Calle, Lebron #50, Los Alcarrizos	Camara de seguridad
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.roles (id, name, config, "createdAt", "updatedAt") FROM stdin;
3	vendedor	{"modules": {"ventas": "full", "clientes": "full", "reportes": "none", "inventario": "none"}, "viewScope": "own"}	2026-06-10 10:39:32.007859	2026-06-10 10:39:32.007859
2	supervisor	{"modules": {"ventas": "view", "clientes": "view", "reportes": "view", "inventario": "view"}, "viewScope": "all"}	2026-06-10 10:39:32.003132	2026-06-25 18:58:40.887492
1	admin	{"modules": {"lotes": "full", "alerta": "full", "campos": "full", "conteo": "full", "ventas": "full", "almacen": "full", "clientes": "full", "comodato": "full", "reportes": "full", "seriales": "full", "tecnicos": "full", "unidades": "full", "categoria": "full", "productos": "full", "inventario": "full", "movimiento": "full", "proveedores": "full", "configuracion": "full", "integraciones": "full"}, "viewScope": "all"}	2026-06-10 10:39:31.994788	2026-06-25 19:12:12.024641
4	cajero	{"modules": {"lotes": "view", "alerta": "full", "campos": "view", "conteo": "view", "ventas": "full", "almacen": "view", "clientes": "view", "comodato": "view", "reportes": "view", "seriales": "view", "tecnicos": "view", "unidades": "view", "categoria": "view", "productos": "view", "inventario": "none", "movimiento": "view", "proveedores": "view", "configuracion": "none", "integraciones": "view"}, "viewScope": "own"}	2026-06-10 10:39:32.012076	2026-06-25 19:16:57.929777
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.sale_items (id, "saleId", "productoId", cantidad, precio) FROM stdin;
1	1	7	3	1200.00
2	2	2	1	2500.00
3	3	7	1	1200.00
4	4	5	1	1900.00
5	5	2	1	2500.00
6	6	11	1	8.00
7	7	11	1	8000.00
8	8	2	1	2500.00
9	9	7	1	1200.00
10	10	11	1	8000.00
11	11	8	1	2000.00
12	12	9	1	5000.00
13	13	19	1	2499.98
14	14	19	1	2499.98
15	15	20	1	688.00
16	16	20	1	688.00
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.sales (id, cliente, rnc, subtotal, descuento, itbis, total, "vendedorId", fecha) FROM stdin;
1	Consumidor Final		6000.00	0.00	1080.00	7080.00	user-123	2026-05-14 15:41:25.330649
2	Consumidor Final	---	2500.00	0.00	450.00	2950.00	1	2026-05-15 13:13:19.763088
3	Consumidor Final	---	1200.00	0.00	216.00	1416.00	1	2026-05-15 13:14:06.618398
4	Consumidor Final	---	1900.00	0.00	342.00	2242.00	1	2026-05-15 20:36:59.743011
5	Consumidor Final	---	2500.00	450.00	369.00	2419.00	1	2026-05-20 20:52:12.25695
6	Consumidor Final	---	8.00	0.00	1.44	9.44	1	2026-05-21 19:03:20.973544
7	Consumidor Final	---	8000.00	0.00	1440.00	9440.00	1	2026-05-21 19:05:15.847796
8	Consumidor Final	---	2500.00	0.00	450.00	2950.00	1	2026-05-21 21:24:39.824093
9	Pedro marinez	1122113	1200.00	0.00	216.00	1416.00	2	2026-05-23 16:49:41.501347
10	Pedro marinez	1122113	8000.00	0.00	1440.00	9440.00	4	2026-06-03 14:29:31.43228
11	Pedro marinez	1122113	2000.00	0.00	360.00	2360.00	4	2026-06-03 14:36:07.517453
12	Pedro marinez	1122113	5000.00	0.00	900.00	5900.00	4	2026-06-09 14:29:26.953616
13	Ernesto Cueva	22900467845	2499.98	0.00	25.00	2524.98	3	2026-06-25 13:00:19.848625
14	Ernesto Cueva	22900467845	2499.98	0.00	25.00	2524.98	3	2026-06-25 18:59:14.884923
15	Ernesto Cueva	22900467845	688.00	0.00	6.88	694.88	8	2026-06-25 19:03:30.590845
16	Ernesto Cueva	22900467845	688.00	0.00	6.88	694.88	8	2026-06-25 19:18:01.551972
\.


--
-- Data for Name: technicians; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.technicians (id, nombre, telefono, email, "isActive", "createdAt", "updatedAt") FROM stdin;
1	Hernesto Cueva	8095678998	hcueva@gmail.com	t	2026-06-19 16:55:56.361119	2026-06-19 16:55:56.361119
2	Amauri	8098972783893	sdsdsd@gmail.com	t	2026-06-22 11:23:08.997928	2026-06-22 11:23:08.997928
\.


--
-- Data for Name: unidades_medida; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.unidades_medida (id, codigo, nombre, activo) FROM stdin;
1	UND	Unidad	t
2	CAJ	Caja	t
3	LB	Libra	t
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.users (id, nombre, email, password, rol, "isActive", "createdAt", "updatedAt", "resetToken", "resetTokenExpiresAt") FROM stdin;
3	Admin Test	techtwosolution2@gmail.com	$2b$10$/9t0mx5T039/XDOl6KRChOKyZ4Chw2YPSfkNauBnVt/XEzbDNuBXG	admin	t	2026-06-10 10:39:30.070425	2026-06-22 10:57:04.061282	4fe1e1663a09143d131a569980202747cf091db0f41645a8db0698beb3ca43c0	2026-06-22 11:56:41.443
1	Admin 2	admin2@gmail.com	$2b$10$BU5OwK80bLSYtoqhChUpteSnnggZ5ESmGZIut0Lpf/l5WMdhaprLa	admin	t	2026-05-29 11:49:15.434106	2026-06-25 18:53:58.875019	\N	\N
8	Prueba 1	prueba1@gmail.com	$2b$10$R6M5lxnRq.deUbuKvPLKOehmsOL.Pyts8Al6t/FH.cIBPa38y/R6K	cajero	t	2026-06-25 18:54:30.779478	2026-06-25 19:15:19.318377	\N	\N
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: tech2_admin
--

COPY public.warehouses (id, nombre, descripcion, ubicaciones, is_active, "createdAt", "updatedAt") FROM stdin;
1	ALMACEN CALLE LEBRON	Este almacen coniene los producto de entrada	[{"tipo": "Estante", "codigo": "T-1", "nombre": "TRAMO-1"}, {"tipo": "Estante", "codigo": "T-2", "nombre": "TRAMO-2"}, {"tipo": "Estante", "codigo": "T-3", "nombre": "TRAMO-3"}, {"tipo": "Estante", "codigo": "T-4", "nombre": "TRAMO -4"}]	t	2026-05-22 17:01:50.187515	2026-06-24 13:01:22.148168
2	ALMACEN DE LA OFICICINA	ALMACEN PRINCIPAL	[{"tipo": "Nivel", "codigo": "P-A-2", "nombre": "PISO -2"}]	t	2026-06-09 14:43:10.815056	2026-06-24 14:57:21.675392
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tech2_admin
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tech2_admin
--

SELECT pg_catalog.setval('public.categories_id_seq', 3, true);


--
-- Name: clients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tech2_admin
--

SELECT pg_catalog.setval('public.clients_id_seq', 4, true);


--
-- Name: comodatos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tech2_admin
--

SELECT pg_catalog.setval('public.comodatos_id_seq', 13, true);


--
-- Name: count_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tech2_admin
--

SELECT pg_catalog.setval('public.count_items_id_seq', 52, true);


--
-- Name: inventory_batches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tech2_admin
--

SELECT pg_catalog.setval('public.inventory_batches_id_seq', 11, true);


--
-- Name: inventory_count_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tech2_admin
--

SELECT pg_catalog.setval('public.inventory_count_items_id_seq', 1, false);


--
-- Name: inventory_counts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tech2_admin
--

SELECT pg_catalog.setval('public.inventory_counts_id_seq', 6, true);


--
-- Name: movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tech2_admin
--

SELECT pg_catalog.setval('public.movements_id_seq', 124, true);


--
-- Name: product_serials_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tech2_admin
--

SELECT pg_catalog.setval('public.product_serials_id_seq', 37, true);


--
-- Name: product_warehouse_stock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tech2_admin
--

SELECT pg_catalog.setval('public.product_warehouse_stock_id_seq', 65, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tech2_admin
--

SELECT pg_catalog.setval('public.products_id_seq', 20, true);


--
-- Name: providers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tech2_admin
--

SELECT pg_catalog.setval('public.providers_id_seq', 2, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tech2_admin
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- Name: sale_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tech2_admin
--

SELECT pg_catalog.setval('public.sale_items_id_seq', 16, true);


--
-- Name: sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tech2_admin
--

SELECT pg_catalog.setval('public.sales_id_seq', 16, true);


--
-- Name: technicians_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tech2_admin
--

SELECT pg_catalog.setval('public.technicians_id_seq', 2, true);


--
-- Name: unidades_medida_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tech2_admin
--

SELECT pg_catalog.setval('public.unidades_medida_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tech2_admin
--

SELECT pg_catalog.setval('public.users_id_seq', 8, true);


--
-- Name: warehouses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: tech2_admin
--

SELECT pg_catalog.setval('public.warehouses_id_seq', 2, true);


--
-- Name: product_warehouse_stock PK_02b807e9e8ace87a9e66e289b6f; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.product_warehouse_stock
    ADD CONSTRAINT "PK_02b807e9e8ace87a9e66e289b6f" PRIMARY KEY (id);


--
-- Name: products PK_0806c755e0aca124e67c0cf6d7d; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY (id);


--
-- Name: inventory_batches PK_1b670b7f687d8b8c58ef8d4629a; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.inventory_batches
    ADD CONSTRAINT "PK_1b670b7f687d8b8c58ef8d4629a" PRIMARY KEY (id);


--
-- Name: audit_logs PK_1bb179d048bbc581caa3b013439; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY (id);


--
-- Name: categories PK_24dbc6126a28ff948da33e97d3b; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY (id);


--
-- Name: comodato_products PK_374b0286bae035af7310478daff; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.comodato_products
    ADD CONSTRAINT "PK_374b0286bae035af7310478daff" PRIMARY KEY (comodato_id, product_id);


--
-- Name: product_serials PK_37833362dcb4f82757734a1965a; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.product_serials
    ADD CONSTRAINT "PK_37833362dcb4f82757734a1965a" PRIMARY KEY (id);


--
-- Name: sales PK_4f0bc990ae81dba46da680895ea; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "PK_4f0bc990ae81dba46da680895ea" PRIMARY KEY (id);


--
-- Name: warehouses PK_56ae21ee2432b2270b48867e4be; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT "PK_56ae21ee2432b2270b48867e4be" PRIMARY KEY (id);


--
-- Name: sale_items PK_5a7dc5b4562a9e590528b3e08ab; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT "PK_5a7dc5b4562a9e590528b3e08ab" PRIMARY KEY (id);


--
-- Name: movements PK_5a8e3da15ab8f2ce353e7f58f67; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.movements
    ADD CONSTRAINT "PK_5a8e3da15ab8f2ce353e7f58f67" PRIMARY KEY (id);


--
-- Name: comodatos PK_68876b7e119ceefb980499c814a; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.comodatos
    ADD CONSTRAINT "PK_68876b7e119ceefb980499c814a" PRIMARY KEY (id);


--
-- Name: inventory_counts PK_8230343330002d07a2efb485680; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.inventory_counts
    ADD CONSTRAINT "PK_8230343330002d07a2efb485680" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: providers PK_af13fc2ebf382fe0dad2e4793aa; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT "PK_af13fc2ebf382fe0dad2e4793aa" PRIMARY KEY (id);


--
-- Name: technicians PK_b14514b23605f79475be53065b3; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.technicians
    ADD CONSTRAINT "PK_b14514b23605f79475be53065b3" PRIMARY KEY (id);


--
-- Name: unidades_medida PK_b299f0e6758c0c02ae3e729232a; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.unidades_medida
    ADD CONSTRAINT "PK_b299f0e6758c0c02ae3e729232a" PRIMARY KEY (id);


--
-- Name: roles PK_c1433d71a4838793a49dcad46ab; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY (id);


--
-- Name: count_items PK_cb3d7823c0b4b1b6b1c3f3267dd; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.count_items
    ADD CONSTRAINT "PK_cb3d7823c0b4b1b6b1c3f3267dd" PRIMARY KEY (id);


--
-- Name: inventory_count_items PK_e1e695e1a140cdc8b94542d4956; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.inventory_count_items
    ADD CONSTRAINT "PK_e1e695e1a140cdc8b94542d4956" PRIMARY KEY (id);


--
-- Name: clients PK_f1ab7cf3a5714dbc6bb4e1c28a4; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY (id);


--
-- Name: warehouses UQ_03f6ea0df5f3df3b344c358d079; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT "UQ_03f6ea0df5f3df3b344c358d079" UNIQUE (nombre);


--
-- Name: roles UQ_648e3f5447f725579d7d4ffdfb7; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE (name);


--
-- Name: categories UQ_8053c619b9d0eaebeeeae2a0be5; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT "UQ_8053c619b9d0eaebeeeae2a0be5" UNIQUE (nombre);


--
-- Name: technicians UQ_8a1bb4e6ba609f2c9805fc1c889; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.technicians
    ADD CONSTRAINT "UQ_8a1bb4e6ba609f2c9805fc1c889" UNIQUE (nombre);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: product_warehouse_stock UQ_be1b1ebaba221dd3d8a78fab37c; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.product_warehouse_stock
    ADD CONSTRAINT "UQ_be1b1ebaba221dd3d8a78fab37c" UNIQUE ("productoId", almacen);


--
-- Name: unidades_medida UQ_d97cb04b559197c7009e0f8903c; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.unidades_medida
    ADD CONSTRAINT "UQ_d97cb04b559197c7009e0f8903c" UNIQUE (codigo);


--
-- Name: products UQ_e7a41b4ae1811faffbf9da6a55d; Type: CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "UQ_e7a41b4ae1811faffbf9da6a55d" UNIQUE (codigo);


--
-- Name: IDX_0afa7f4c1545fbdba4c8467ca5; Type: INDEX; Schema: public; Owner: tech2_admin
--

CREATE INDEX "IDX_0afa7f4c1545fbdba4c8467ca5" ON public.comodato_products USING btree (product_id);


--
-- Name: IDX_d355d06deeeceeef48ede7c9ae; Type: INDEX; Schema: public; Owner: tech2_admin
--

CREATE UNIQUE INDEX "IDX_d355d06deeeceeef48ede7c9ae" ON public.product_serials USING btree ("serialNumber", "productoId");


--
-- Name: IDX_e0c66cc683ced1787e5d9cc487; Type: INDEX; Schema: public; Owner: tech2_admin
--

CREATE INDEX "IDX_e0c66cc683ced1787e5d9cc487" ON public.comodato_products USING btree (comodato_id);


--
-- Name: comodato_products FK_0afa7f4c1545fbdba4c8467ca54; Type: FK CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.comodato_products
    ADD CONSTRAINT "FK_0afa7f4c1545fbdba4c8467ca54" FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: movements FK_10c9b49c970231a3b884233858b; Type: FK CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.movements
    ADD CONSTRAINT "FK_10c9b49c970231a3b884233858b" FOREIGN KEY ("productoId") REFERENCES public.products(id);


--
-- Name: comodatos FK_16236b394b38f1e17a900b777f7; Type: FK CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.comodatos
    ADD CONSTRAINT "FK_16236b394b38f1e17a900b777f7" FOREIGN KEY ("usuarioId") REFERENCES public.users(id);


--
-- Name: products FK_6dab3277ceb5b22b1e633deca8a; Type: FK CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "FK_6dab3277ceb5b22b1e633deca8a" FOREIGN KEY ("proveedorId") REFERENCES public.providers(id);


--
-- Name: movements FK_a590490f6a30a44f3cebdcff4ec; Type: FK CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.movements
    ADD CONSTRAINT "FK_a590490f6a30a44f3cebdcff4ec" FOREIGN KEY ("technicianId") REFERENCES public.technicians(id);


--
-- Name: count_items FK_b725c2af41b1422254e6b3ad289; Type: FK CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.count_items
    ADD CONSTRAINT "FK_b725c2af41b1422254e6b3ad289" FOREIGN KEY ("conteoId") REFERENCES public.inventory_counts(id) ON DELETE CASCADE;


--
-- Name: inventory_count_items FK_bb6aee985ac48f507bfb5f9e57c; Type: FK CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.inventory_count_items
    ADD CONSTRAINT "FK_bb6aee985ac48f507bfb5f9e57c" FOREIGN KEY ("inventoryCountId") REFERENCES public.inventory_counts(id) ON DELETE CASCADE;


--
-- Name: inventory_batches FK_c01abc6e0efde792147ecd7af25; Type: FK CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.inventory_batches
    ADD CONSTRAINT "FK_c01abc6e0efde792147ecd7af25" FOREIGN KEY ("productoId") REFERENCES public.products(id);


--
-- Name: sale_items FK_c642be08de5235317d4cf3deb40; Type: FK CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT "FK_c642be08de5235317d4cf3deb40" FOREIGN KEY ("saleId") REFERENCES public.sales(id);


--
-- Name: product_warehouse_stock FK_dc0d6f28f1752987583b28b452b; Type: FK CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.product_warehouse_stock
    ADD CONSTRAINT "FK_dc0d6f28f1752987583b28b452b" FOREIGN KEY ("productoId") REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: comodato_products FK_e0c66cc683ced1787e5d9cc4877; Type: FK CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.comodato_products
    ADD CONSTRAINT "FK_e0c66cc683ced1787e5d9cc4877" FOREIGN KEY (comodato_id) REFERENCES public.comodatos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comodatos FK_efdf8626bf1b21414e9214a4c86; Type: FK CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.comodatos
    ADD CONSTRAINT "FK_efdf8626bf1b21414e9214a4c86" FOREIGN KEY ("productoId") REFERENCES public.products(id);


--
-- Name: product_serials FK_f9d13a2a553c4093011222a2f65; Type: FK CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.product_serials
    ADD CONSTRAINT "FK_f9d13a2a553c4093011222a2f65" FOREIGN KEY ("productoId") REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: movements FK_fdab1866f6e8042276d0a1a01fd; Type: FK CONSTRAINT; Schema: public; Owner: tech2_admin
--

ALTER TABLE ONLY public.movements
    ADD CONSTRAINT "FK_fdab1866f6e8042276d0a1a01fd" FOREIGN KEY ("usuarioId") REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict Rksl4kfMpNqILxMg8MeqX9tl6V6CEIy87u9hAa6AnoGIUoddiRtbjWg4gKnKFb3

