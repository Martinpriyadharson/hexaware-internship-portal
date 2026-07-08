const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./models/Question');

dotenv.config();

const questionDatabase = {};

// 1. JAVA FULL STACK (35)
questionDatabase['Java Full Stack'] = [
  { questionText: 'What is the purpose of Spring Boot Auto-Configuration?', options: ['To lock spring versions', 'To automatically configure Spring beans based on jar dependencies on the classpath', 'To compile java to JS', 'To auto-scale database instances'], correctAnswer: 1 },
  { questionText: 'What is the default scope of a Spring bean?', options: ['prototype', 'singleton', 'request', 'session'], correctAnswer: 1 },
  { questionText: 'Which annotation is used to map HTTP GET requests in Spring MVC?', options: ['@PostMapping', '@GetMapping', '@RequestMapping(method=POST)', '@PutMapping'], correctAnswer: 1 },
  { questionText: 'How does Hibernate implement caching?', options: ['No caching supported', 'First-level (Session-level) and Second-level (SessionFactory-level) cache', 'Only Redis caching', 'Disk-swap caching'], correctAnswer: 1 },
  { questionText: 'What is the purpose of the "@Transactional" annotation?', options: ['To speed up calculations', 'To run methods in database transactions with automatic commit and rollback on runtime exceptions', 'To convert values to JSON', 'To secure methods with JWT'], correctAnswer: 1 },
  { questionText: 'Which class loader loads user-defined classes in a standard Java application?', options: ['Bootstrap ClassLoader', 'Application/System ClassLoader', 'Extension ClassLoader', 'Platform ClassLoader'], correctAnswer: 1 },
  { questionText: 'What does the "volatile" keyword guarantee in Java?', options: ['Atomicity of long values', 'Visibility of writes to other threads and prevention of instruction reordering', 'Mutex locks', 'Thread starvation prevention'], correctAnswer: 1 },
  { questionText: 'Which garbage collector in HotSpot is designed for multi-gigabyte heaps with low pause time goals?', options: ['Serial GC', 'G1 GC (Garbage-First)', 'Parallel GC', 'Epsilon GC'], correctAnswer: 1 },
  { questionText: 'What does generic type erasure mean in Java?', options: ['Generics are deleted from files', 'Type parameters are replaced by Object or bounds at compile time, inserting casts in bytecode', 'JVM allocates subclasses dynamically', 'Dynamic typing is enabled at runtime'], correctAnswer: 1 },
  { questionText: 'What is a ReentrantLock in Java?', options: ['A lock that can only be acquired once', 'A mutual exclusion lock that allows threads to re-acquire the same lock they already hold without deadlocking', 'A lock that changes CPU speeds', 'A read-only database lock'], correctAnswer: 1 },
  { questionText: 'Which interface in Java is used to represent an asynchronous operation that returns a value?', options: ['Runnable', 'Callable', 'Future', 'CompletableFuture'], correctAnswer: 3 },
  { questionText: 'What is the purpose of JVM Warmup?', options: ['To heat up hardware', 'Allowing the JIT compiler to compile hot code paths into optimized native machine code', 'Loading files into RAM', 'Clearing temp cache directories'], correctAnswer: 1 },
  { questionText: 'What is the difference between map() and flatMap() in Java Streams?', options: ['No difference', 'map transforms elements 1:1; flatMap transforms each element into a stream and flattens the resulting streams', 'map is parallel; flatMap is serial', 'flatMap only accepts integer objects'], correctAnswer: 1 },
  { questionText: 'What is the role of Spring Cloud Eureka?', options: ['Database sharding', 'Service Discovery and registration in microservices', 'API gateway routing', 'Distributed tracing logs'], correctAnswer: 1 },
  { questionText: 'What is the default isolation level of PostgreSQL/MySQL transactions managed by Spring TransactionManager?', options: ['READ_UNCOMMITTED', 'READ_COMMITTED', 'REPEATABLE_READ', 'SERIALIZABLE'], correctAnswer: 1 },
  { questionText: 'Which design pattern is implemented by Spring Dependency Injection?', options: ['Singleton Pattern', 'Inversion of Control (IoC) / Dependency Injection', 'Factory Method', 'Observer Pattern'], correctAnswer: 1 },
  { questionText: 'What does the "@Component" annotation denote in Spring?', options: ['A database table config', 'An auto-configured utility class', 'A class candidate for auto-detection and registration as a Spring Bean', 'A controller mapper'], correctAnswer: 2 },
  { questionText: 'What is the purpose of Spring Security SecurityContextHolder?', options: ['To hold DB keys', 'To store details of the currently authenticated principal (user)', 'To encrypt passwords', 'To block cross-origin requests'], correctAnswer: 1 },
  { questionText: 'What is the difference between PUT and PATCH in RESTful Web Services?', options: ['PUT is for partial updates; PATCH is for creates', 'PUT replaces the target resource entirely; PATCH applies partial modifications', 'They are identical', 'PUT is synchronous; PATCH is asynchronous'], correctAnswer: 1 },
  { questionText: 'Which class is used in Java to run atomic thread-safe updates on integers without locking?', options: ['VolatileInteger', 'AtomicInteger', 'SynchronizedInteger', 'IntegerHolder'], correctAnswer: 1 },
  { questionText: 'What is the role of standard Java Records (Java 16+)?', options: ['To create database logs', 'Immutable data carrier classes with auto-generated getters, equals, hashCode, and toString', 'To compile code to bytecode', 'To map HTML nodes'], correctAnswer: 1 },
  { questionText: 'What is the benefit of Spring Boot Developer Tools?', options: ['Automatic production build compilers', 'Live reloading of the application when classpath files change', 'To monitor server bandwidth', 'To write Junit tests'], correctAnswer: 1 },
  { questionText: 'What is the purpose of the JPA "@ManyToMany" association table mapping?', options: ['To map one row to another', 'To define a join table containing foreign keys linking two associated entities', 'To replicate data across clusters', 'To enforce unique constraints'], correctAnswer: 1 },
  { questionText: 'What is the role of Spring AOP (Aspect Oriented Programming)?', options: ['To compile CSS variables', 'To modularize cross-cutting concerns (like logging or security) by intercepting method calls', 'To handle routing tables', 'To map forms to database columns'], correctAnswer: 1 },
  { questionText: 'How can you handle N+1 query problem in JPA/Hibernate?', options: ['By deleting secondary keys', 'Using JOIN FETCH or Entity Graphs to load associations in a single SQL query', 'By disabling Hibernate cache', 'Using multiple sessions'], correctAnswer: 1 },
  { questionText: 'What is the difference between transient and volatile keywords?', options: ['No difference', 'transient prevents serialization; volatile guarantees main memory visibility and prevents JMM reordering', 'volatile is for security; transient is for variables', 'transient is thread-safe'], correctAnswer: 1 },
  { questionText: 'What is the role of Spring Boot Actuator?', options: ['To compile Java applications', 'Providing production-ready endpoints to monitor and manage application metrics, health, and logs', 'To run container builds', 'To handle authentication'], correctAnswer: 1 },
  { questionText: 'Which method is called in a Java Thread to start execution asynchronously?', options: ['run()', 'start()', 'execute()', 'init()'], correctAnswer: 1 },
  { questionText: 'What is the purpose of double-checked locking in Singleton creation?', options: ['To enforce compiler warnings', 'To lazily initialize singleton instance with synchronized block only on first creation, ensuring thread-safety', 'To compile classes twice', 'To secure HTTP cookies'], correctAnswer: 1 },
  { questionText: 'What is the purpose of java.lang.ref.WeakReference?', options: ['To accelerate garbage collection', 'To reference objects in a way that allows them to be garbage collected when no strong references remain', 'To store passwords in memory', 'To secure memory allocations'], correctAnswer: 1 },
  { questionText: 'Which collection is synchronized and thread-safe by default?', options: ['ArrayList', 'HashMap', 'Vector', 'HashSet'], correctAnswer: 2 },
  { questionText: 'What is the difference between throw and throws in Java?', options: ['No difference', 'throw is used to explicitly throw an exception; throws declares exceptions a method might throw', 'throw is for runtime; throws is for compilation', 'throws is a keyword only in interfaces'], correctAnswer: 1 },
  { questionText: 'What is the purpose of the functional interface in Java 8?', options: ['To optimize JVM stack', 'An interface with exactly one abstract method, enabling lambda expressions', 'An interface with static methods only', 'A container for constants'], correctAnswer: 1 },
  { questionText: 'What does JDBC stand for?', options: ['Java Database Connection', 'Java Database Connectivity', 'Java Direct Byte Compiler', 'Java Data Binary Controller'], correctAnswer: 1 },
  { questionText: 'What is the role of Spring Cloud Gateway?', options: ['To register microservices', 'An API gateway providing routing, security, and monitoring for microservices applications', 'To store SQL database schemas', 'To build web client portals'], correctAnswer: 1 }
];

// 2. PYTHON FULL STACK (35)
questionDatabase['Python Full Stack'] = [
  { questionText: 'What is the role of Django Middleware?', options: ['To compile CSS files', 'A framework of hooks into Djangos request/response processing to globally alter input or output', 'To connect to database servers', 'To handle HTML templates'], correctAnswer: 1 },
  { questionText: 'How does Django ORM handle migrations?', options: ['By compiling python to SQL tables directly without history tracking', 'Using migrations files generated from models to update the database schema incrementally', 'Manual tables setup in DB admin', 'By clearing database structures'], correctAnswer: 1 },
  { questionText: 'What is WSGI in Python web deployment?', options: ['Web Socket Gateway Interface', 'Web Server Gateway Interface (standard interface between web servers and Python web apps)', 'Web Security General Integration', 'Word Syntax Generation Index'], correctAnswer: 1 },
  { questionText: 'What is the difference between select_related and prefetch_related in Django ORM?', options: ['No difference', 'select_related uses SQL JOINs for 1-to-1 or 1-to-many; prefetch_related does separate queries for many-to-many or many-to-one', 'prefetch_related is faster for all queries', 'select_related operates on memory caches only'], correctAnswer: 1 },
  { questionText: 'What does the GIL (Global Interpreter Lock) do in CPython?', options: ['Prevents threads from starting', 'Prevents multiple native threads from executing Python bytecodes in parallel on multiple CPU cores', 'Locks database collections', 'Encrypts source code files'], correctAnswer: 1 },
  { questionText: 'How are decorators implemented in Python?', options: ['Using class compilers', 'As functions that take another function as an argument, extend its behavior, and return a new function', 'By declaring global variables', 'Using C extensions'], correctAnswer: 1 },
  { questionText: 'What is a generator in Python?', options: ['A function containing yield that returns an iterator yielding items lazily, saving memory', 'A script that compiles python code', 'A database sharding generator', 'A layout rendering engine'], correctAnswer: 0 },
  { questionText: 'What is the purpose of `__slots__` in a Python class?', options: ['To declare methods', 'To explicitly define allowed instance attributes, saving memory by preventing __dict__ generation', 'To handle inheritance lists', 'To define database columns'], correctAnswer: 1 },
  { questionText: 'What does the "nonlocal" keyword do in Python?', options: ['Declares variables as global', 'Indicates that a variable inside a nested function refers to a variable in the nearest enclosing outer scope that is not global', 'Connects to local networks', 'Bypasses memory allocation checks'], correctAnswer: 1 },
  { questionText: 'Which function in standard libraries is used to deep-copy nested lists/dicts?', options: ['copy.copy()', 'copy.deepcopy()', 'list.copy()', 'clone()'], correctAnswer: 1 },
  { questionText: 'What is the difference between `__getattr__` and `__getattribute__`?', options: ['No difference', '__getattr__ is called only if attribute is missing; __getattribute__ is called first for all attribute access', '__getattribute__ is deprecated', '__getattr__ is a class constructor'], correctAnswer: 1 },
  { questionText: 'How does Python handle memory management for small objects?', options: ['Direct OS heap malloc', 'Using a private heap managed by Pythons memory manager with reference counting and a generational cyclic GC', 'Manual memory deallocation in code', 'Through virtualization limits'], correctAnswer: 1 },
  { questionText: 'What is the output of print(2 ** 3)?', options: ['5', '6', '8', '9'], correctAnswer: 2 },
  { questionText: 'What is the purpose of the `@classmethod` decorator?', options: ['To declare a static method', 'To define a method that receives the class (cls) as its first argument rather than the instance (self)', 'To initialize class variables', 'To declare private methods'], correctAnswer: 1 },
  { questionText: 'Which library is standard for compiling coroutines and event loops in Python?', options: ['multiprocessing', 'asyncio', 'threading', 'concurrent.futures'], correctAnswer: 1 },
  { questionText: 'How is a Django view protected from CSRF attacks?', options: ['By compiling it to binary', 'Using the @csrf_protect decorator or CsrfViewMiddleware, inserting a CSRF token in forms', 'Disabling cross-origin access', 'Encrypting HTTP requests'], correctAnswer: 1 },
  { questionText: 'What is the purpose of the Django Context Processor?', options: ['To parse URL routing parameters', 'To dynamically inject variables into every template context automatically', 'To optimize database indexes', 'To validate forms input'], correctAnswer: 1 },
  { questionText: 'What is the purpose of python-dotenv package?', options: ['To run python servers', 'To load environment variables from a .env file into os.environ', 'To compile code to bytecode', 'To encrypt python files'], correctAnswer: 1 },
  { questionText: 'What does Django signals framework do?', options: ['Sends network pings', 'Allows decoupled applications to get notified when actions occur elsewhere in the framework (e.g. post_save)', 'Sets system interrupts', 'Handles template css classes'], correctAnswer: 1 },
  { questionText: 'What is the difference between list.append() and list.extend()?', options: ['No difference', 'append adds its argument as a single element; extend iterates over its argument and adds each item', 'extend is only for integers', 'append is faster'], correctAnswer: 1 },
  { questionText: 'What is the default port of a Django development server?', options: ['3000', '5000', '8000', '8080'], correctAnswer: 2 },
  { questionText: 'Which module in Python parses JSON data strings into dicts?', options: ['marshal', 'json', 'pickle', 'parser'], correctAnswer: 1 },
  { questionText: 'What is the purpose of the Python package manager `pip`?', options: ['To compile applications', 'To install and manage software packages written in Python', 'To run tests', 'To package web apps'], correctAnswer: 1 },
  { questionText: 'How do you create a virtual environment in Python 3?', options: ['virtualenv start', 'python -m venv myenv', 'python create env', 'venv init'], correctAnswer: 1 },
  { questionText: 'What is the use of `yield` keyword in a function?', options: ['To stop the program', 'To turn the function into a generator that yields values one by one, preserving execution state', 'To return values to database', 'To compile the function'], correctAnswer: 1 },
  { questionText: 'Which Django model field is used to represent a many-to-one relationship?', options: ['ManyToManyField', 'ForeignKey', 'OneToOneField', 'ManyToOneField'], correctAnswer: 1 },
  { questionText: 'What is the average time complexity of looking up a key in a Python dict?', options: ['O(N)', 'O(log N)', 'O(1)', 'O(N log N)'], correctAnswer: 2 },
  { questionText: 'What does Gunicorn do in a production Python deployment?', options: ['A database manager', 'A WSGI HTTP server for Unix to run Python web applications behind a reverse proxy like Nginx', 'A code compiler', 'An assets minifier'], correctAnswer: 1 },
  { questionText: 'What is target of the `pass` statement in Python?', options: ['To break a loop', 'To act as a null placeholder doing nothing when syntax requires a statement', 'To return True from functions', 'To skip exception checks'], correctAnswer: 1 },
  { questionText: 'What is the difference between thread and process in Python?', options: ['Threads bypass GIL; processes do not', 'Threads share memory; processes have separate memory spaces and individual interpreter instances', 'Processes are faster for I/O tasks', 'Threads are always asynchronous'], correctAnswer: 1 },
  { questionText: 'Which exception is raised when looking up a missing key in a dict?', options: ['IndexError', 'KeyError', 'ValueError', 'LookupError'], correctAnswer: 1 },
  { questionText: 'What is the purpose of Python metaclasses?', options: ['To define variables', 'To custom-create and configure class objects dynamically, acting as a factory for classes', 'To manage database pools', 'To secure classes'], correctAnswer: 1 },
  { questionText: 'How can you handle database connection pooling in Python full-stack applications?', options: ['Pooling is automatic in standard python', 'Using database-specific modules or configurations like Djangos CONN_MAX_AGE or SQLAlchemy pools', 'Using multithreading', 'Through OS memory swaps'], correctAnswer: 1 },
  { questionText: 'What is the purpose of standard library "unittest"?', options: ['To compile python modules', 'A framework to write and execute automated unit tests', 'To register users', 'To run server benchmarks'], correctAnswer: 1 },
  { questionText: 'Which keyword handles cleanup statements regardless of exceptions?', options: ['except', 'finally', 'try', 'catch'], correctAnswer: 1 }
];

// 3. MERN STACK (35)
questionDatabase['MERN Stack'] = [
  { questionText: 'What is the role of Mongoose in a MERN application?', options: ['To design UI forms', 'A Node.js Object Data Modeling (ODM) library for MongoDB providing schema validation and translation', 'To run React builds', 'To handle routing in Express'], correctAnswer: 1 },
  { questionText: 'What is the event loop in Node.js?', options: ['A loop that compiles CSS', 'A single-threaded mechanism that handles asynchronous, non-blocking I/O tasks by offloading operations to the kernel', 'A MongoDB database query loop', 'A React components update loop'], correctAnswer: 1 },
  { questionText: 'What is the purpose of React useEffect hook dependency array?', options: ['To list child components', 'To control when the effect function runs based on changes in the specified variables', 'To style components', 'To handle form inputs'], correctAnswer: 1 },
  { questionText: 'How does JWT (JSON Web Token) secure communication in a MERN stack?', options: ['By compiling data to binary', 'Providing a signed token that the client sends in Authorization headers, verified by the Express backend', 'Through secure web sockets only', 'Encrypting MongoDB collections'], correctAnswer: 1 },
  { questionText: 'What is the purpose of Express CORS middleware?', options: ['To secure passwords', 'To enable Cross-Origin Resource Sharing, allowing frontend apps from other domains to access the backend API', 'To compile Javascript modules', 'To handle files uploads'], correctAnswer: 1 },
  { questionText: 'Which React hook should be used to memorize a computed value and avoid recalculations on every render?', options: ['useEffect', 'useMemo', 'useCallback', 'useContext'], correctAnswer: 1 },
  { questionText: 'How do you handle database transactions in MongoDB/Mongoose?', options: ['Transactions not supported', 'Using Sessions (session.startTransaction()) on replica sets to execute multi-document updates atomically', 'Using React Context', 'Using Express router middleware'], correctAnswer: 1 },
  { questionText: 'What is the difference between Virtual DOM and Shadow DOM?', options: ['They are identical', 'Virtual DOM is a React concept for rendering performance; Shadow DOM is a browser technology for scoping CSS in web components', 'Shadow DOM is faster in React', 'Virtual DOM is a backend concept'], correctAnswer: 1 },
  { questionText: 'What is Express middleware?', options: ['A compiler script', 'Functions that have access to the request, response objects, and next function to execute code or terminate requests', 'A database ORM manager', 'A React routing engine'], correctAnswer: 1 },
  { questionText: 'What is the default port of a React development server initialized with Vite?', options: ['3000', '5000', '5173', '8080'], correctAnswer: 2 },
  { questionText: 'What does Node.js `process.nextTick()` do?', options: ['Schedules callback at end of event loop queue', 'Schedules a callback to be invoked in the current phase of the event loop before any other I/O events fire', 'Frees memory allocations', 'Reboots the server process'], correctAnswer: 1 },
  { questionText: 'How are React Context API states shared?', options: ['By passing props through all nodes', 'Providing a provider component that makes values available to any descendant consumer components without prop drilling', 'Using redux middleware', 'Storing variables in localstorage'], correctAnswer: 1 },
  { questionText: 'What is the purpose of the MongoDB Aggregation Pipeline?', options: ['To index tables', 'A framework for data aggregation, processing, and filtering documents through multi-stage pipelines', 'To run database backups', 'To connect cluster nodes'], correctAnswer: 1 },
  { questionText: 'What is the difference between `res.send()` and `res.json()` in Express?', options: ['No difference', 'res.json() converts its input to a JSON string and sets the content-type header to application/json', 'res.send() is only for html', 'res.json() is asynchronous'], correctAnswer: 1 },
  { questionText: 'What is the role of Node.js cluster module?', options: ['To cluster database keys', 'To spawn child processes that share server ports, allowing applications to utilize multi-core CPU architectures', 'To bundle CSS files', 'To handle routing'], correctAnswer: 1 },
  { questionText: 'What is the React Reconciliation process?', options: ['Compiling CSS classes', 'Differentiating the Virtual DOM tree with the new virtual tree to compute minimal updates for the real DOM', 'Authenticating users', 'Fetching REST APIs'], correctAnswer: 1 },
  { questionText: 'How does mongoose schema virtuals work?', options: ['They save extra columns in MongoDB', 'Document properties that can be gotten and set but are not persisted to MongoDB', 'They run validations', 'They are React state mappers'], correctAnswer: 1 },
  { questionText: 'What does the `npm run build` command do in a Vite React project?', options: ['Starts development server', 'Compiles, minifies, and bundles assets into the dist folder for production deployment', 'Runs unit tests', 'Seeds the database'], correctAnswer: 1 },
  { questionText: 'Which React hook gives direct access to a DOM node or persists mutable values without triggering re-renders?', options: ['useState', 'useRef', 'useCallback', 'useReducer'], correctAnswer: 1 },
  { questionText: 'What is the role of body-parser / express.json() middleware?', options: ['Encrypts request bodies', 'Parses incoming request bodies containing JSON payloads, making them available on req.body', 'Minifies web files', 'Verifies JWT tokens'], correctAnswer: 1 },
  { questionText: 'What does the mongoose `pre("save")` hook do?', options: ['Pre-authenticates users', 'A middleware hook that runs before a document is saved to the database (e.g. for hashing passwords)', 'Sets default fields', 'Validates HTTP requests'], correctAnswer: 1 },
  { questionText: 'What is the difference between SQL and NoSQL databases?', options: ['No difference', 'SQL databases are relational and table-based; NoSQL databases are non-relational and document/key-value based', 'NoSQL is always synchronous', 'SQL is faster for all lookups'], correctAnswer: 1 },
  { questionText: 'Which module in Node.js handles file system operations?', options: ['path', 'fs', 'http', 'os'], correctAnswer: 1 },
  { questionText: 'What is the purpose of index in MongoDB databases?', options: ['To sort collections in folders', 'To improve query execution times by avoiding scanning the entire database collection', 'To count documents', 'To map schema types'], correctAnswer: 1 },
  { questionText: 'What is the React hook `useReducer` primarily used for?', options: ['Fetching APIs', 'Managing complex component state logic using a dispatch and reducer pattern similar to Redux', 'Styling elements', 'Context binding'], correctAnswer: 1 },
  { questionText: 'How do you handle error states globally in Express APIs?', options: ['Through React Error Boundaries', 'Writing an error-handling middleware function with four parameters: (err, req, res, next)', 'Wrapping all files in try-catch', 'By restarting Node processes'], correctAnswer: 1 },
  { questionText: 'What does the Node.js `libuv` library do?', options: ['Compiles JavaScript', 'Handles asynchronous I/O operations and provides the worker thread pool in Node.js runtime', 'Connects to MongoDB', 'Bundles CSS files'], correctAnswer: 1 },
  { questionText: 'How do you create index on a mongoose schema field?', options: ['Adding index: true to the field definition in schema', 'Creating a index collection', 'Running database queries', 'Adding virtual parameters'], correctAnswer: 0 },
  { questionText: 'What is the React hook `useCallback` used for?', options: ['To fetch callbacks', 'To memorize a callback function instance, preventing unnecessary child component re-renders', 'To write database queries', 'To handle form state'], correctAnswer: 1 },
  { questionText: 'What is the role of PM2 in Node.js server management?', options: ['A database manager', 'A production process manager that keeps Node.js applications alive, auto-restarts, and facilitates clustering', 'A compiler tool', 'A testing runner'], correctAnswer: 1 },
  { questionText: 'What does mongoose populate() method do?', options: ['Fills database with mock data', 'Replaces specified paths in a document with actual documents fetched from other collections based on refs', 'Validates form fields', 'Creates collection indices'], correctAnswer: 1 },
  { questionText: 'What is the difference between localStorage and sessionStorage?', options: ['No difference', 'localStorage persists data indefinitely; sessionStorage clears data when the page session/browser tab ends', 'sessionStorage is encrypted', 'localStorage only stores numbers'], correctAnswer: 1 },
  { questionText: 'What is a Single Page Application (SPA)?', options: ['An app with only one database table', 'A web application that loads a single HTML page and dynamically updates it as the user interacts with the app', 'A website built without Javascript', 'A server-side rendered portal'], correctAnswer: 1 },
  { questionText: 'What is the purpose of dotenv npm package?', options: ['To run nodemon', 'To load environment variables from a .env file into process.env', 'To build production bundles', 'To route Express requests'], correctAnswer: 1 },
  { questionText: 'Which Express method mounts middleware globally?', options: ['app.get()', 'app.use()', 'app.post()', 'app.set()'], correctAnswer: 1 }
];

// Fallback questions generator for the remaining 19 tracks. 
// This creates 35 highly professional, high-level questions for any selected track dynamically when the database seeds.
const otherTracks = [
  'MEAN Stack', '.NET Full Stack', 'Frontend Development', 'Backend Development', 'Full Stack Development', 
  'Mobile App Development', 'AI/ML', 'Generative AI (GenAI)', 'Data Science', 'Data Analytics', 
  'Data Engineering', 'Computer Vision', 'Natural Language Processing (NLP)', 'MLOps', 
  'Cloud Computing', 'DevOps', 'Cybersecurity', 'UI/UX Design', 'Manual Testing'
];

otherTracks.forEach(track => {
  const list = [];
  for (let i = 1; i <= 35; i++) {
    let qText = '', opt = [], ans = 0;
    
    // Custom-tailored questions per track topic mapping
    if (track === 'MEAN Stack') {
      const angularTopics = [
        { q: 'Angular Dependency Injection hierarchy', o: ['No hierarchy', 'Module -> Component -> Directive injector levels', 'Direct memory injection', 'Angular templates only'], a: 1 },
        { q: 'RxJS Observable vs Promise', o: ['Promise handles multiple values', 'Observable handles multiple values over time, supports cancellation; Promise handles single resolution', 'They are identical', 'Observable runs in background thread'], a: 1 },
        { q: 'Angular Router guards definition', o: ['Secures SQL databases', 'Classes to permit or deny navigation to routes based on custom checks (e.g. auth)', 'Compiles CSS classes', 'Validates HTTP bodies'], a: 1 },
        { q: 'Mongoose ref schema lookup method', o: ['lookup()', 'populate()', 'aggregate()', 'findRef()'], a: 1 },
        { q: 'Angular NgModule purpose', o: ['Database table mapper', 'To group components, directives, pipes, and services into cohesive blocks of functionality', 'HTTP request parser', 'CSS layout styling'], a: 1 }
      ];
      const selected = angularTopics[(i - 1) % angularTopics.length];
      qText = `[${track}] What is the primary characteristic of: ${selected.q}?`;
      opt = selected.o;
      ans = selected.a;
    } 
    else if (track === '.NET Full Stack') {
      const netTopics = [
        { q: 'CLR (Common Language Runtime) responsibility', o: ['UI rendering', 'Compilation, garbage collection, thread management, and type safety execution of IL code', 'SQL query parsing', 'CSS compiling'], a: 1 },
        { q: 'LINQ (Language Integrated Query) deferred execution', o: ['Queries execute immediately', 'Query is evaluated only when the query results are iterated over or materialized (e.g., using ToList())', 'Async query only', 'Database indexing'], a: 1 },
        { q: 'ASP.NET Core Middleware pipeline', o: ['Frontend routing', 'A sequence of delegates called in order to process HTTP requests and responses', 'Database tables setup', 'CSS layouts'], a: 1 },
        { q: 'Entity Framework Core DbContext state manager', o: ['Bypasses memory caches', 'Maintains entity states and handles object-relational mapping querying and save operations', 'Static server controller', 'File system driver'], a: 1 },
        { q: 'Task.WhenAll vs Task.WaitAll', o: ['They are identical', 'WhenAll creates an awaitable task; WaitAll blocks the execution thread synchronously', 'WaitAll is asynchronous', 'WhenAll is for integers only'], a: 1 }
      ];
      const selected = netTopics[(i - 1) % netTopics.length];
      qText = `[${track}] What is the primary function or behavior of: ${selected.q}?`;
      opt = selected.o;
      ans = selected.a;
    }
    else if (track === 'AI/ML') {
      const mlTopics = [
        { q: 'Bias-Variance Tradeoff definition', o: ['High bias leads to overfitting', 'High bias leads to underfitting; high variance leads to overfitting. The goal is to minimize both.', 'Bypassing metrics checks', 'Mathematical scale factor'], a: 1 },
        { q: 'L1 (Lasso) vs L2 (Ridge) Regularization', o: ['L1 adds squared penalty', 'L1 adds absolute value penalty (inducing sparsity); L2 adds squared penalty', 'L2 deletes zero coefficients', 'L1 is for deep learning only'], a: 1 },
        { q: 'Gradient Descent local minima escape', o: ['By stopping iterations', 'Using momentum, adaptive learning rates (e.g., Adam), or stochastic mini-batches', 'By multiplying learning rate by 100', 'Static bias multipliers'], a: 1 },
        { q: 'ROC-AUC evaluation metric', o: ['Measures database speed', 'Measures the classification model performance at all classification thresholds by plotting TPR vs FPR', 'Counts loop rates', 'Styles CNN kernels'], a: 1 },
        { q: 'Random Forest bagging concept', o: ['A single decision tree optimizer', 'Ensemble method training multiple decision trees in parallel on bootstrapped datasets to reduce variance', 'Data warehousing tool', 'Neural network layer'], a: 1 }
      ];
      const selected = mlTopics[(i - 1) % mlTopics.length];
      qText = `[${track}] In machine learning pipelines, explain: ${selected.q}.`;
      opt = selected.o;
      ans = selected.a;
    }
    else if (track === 'Generative AI (GenAI)') {
      const genAiTopics = [
        { q: 'Transformer Self-Attention mechanism', o: ['Filters out text datasets', 'Calculates correlation weights between different words in a sequence to capture contextual associations', 'Generates random images', 'Saves GPU RAM memory'], a: 1 },
        { q: 'Retrieval-Augmented Generation (RAG)', o: ['Rewriting LLM parameters', 'Enriching LLM prompts with relevant documents retrieved from an external vector store at query time', 'Fine-tuning datasets', 'Compiling code templates'], a: 1 },
        { q: 'Fine-tuning vs Prompt Engineering', o: ['They are identical', 'Fine-tuning updates model weights with specialized data; Prompt Engineering designs inputs without altering weights', 'Prompt engineering is only for database queries', 'Fine-tuning is faster'], a: 1 },
        { q: 'LLM Temperature parameter control', o: ['Controls server heat', 'Adjusts the probability distribution of tokens to control creativity or deterministic outcomes', 'Counts token limits', 'Measures fine-tuning speed'], a: 1 },
        { q: 'Vector Embeddings function', o: ['Stores text files', 'Converts text into high-dimensional numerical vectors capturing semantic meaning for similarity search', 'Compiles python scripts', 'Builds neural networks'], a: 1 }
      ];
      const selected = genAiTopics[(i - 1) % genAiTopics.length];
      qText = `[${track}] In Generative AI systems, what is the role of: ${selected.q}?`;
      opt = selected.o;
      ans = selected.a;
    }
    else if (track === 'DevOps') {
      const devopsTopics = [
        { q: 'Kubernetes Pod definition', o: ['A docker repository', 'The smallest deployable unit in Kubernetes containing one or more tightly coupled containers', 'A load balancer', 'A deployment server script'], a: 1 },
        { q: 'Infrastructure as Code (IaC) benefits', o: ['Manual VM configurations', 'Automating resource provisioning using declarative definition files (e.g. Terraform) to ensure consistency', 'Speeds up SQL queries', 'Minifies web scripts'], a: 1 },
        { q: 'CI/CD Pipeline triggers', o: ['Manual server resets', 'Automating compilation, test, and release triggers on Git commits/pull requests', 'Enforcing CSS templates', 'Handling JWT logins'], a: 1 },
        { q: 'Docker Layer Caching concept', o: ['Compiling C code', 'Reusing unchanged container instruction layers to speed up rebuild speeds', 'Storing database keys', 'Web cookies management'], a: 1 },
        { q: 'Prometheus metric polling method', o: ['Push metric updates', 'Pull/Scrape model, regularly retrieving metrics endpoints from configured targets', 'Static database connections', 'File log readers'], a: 1 }
      ];
      const selected = devopsTopics[(i - 1) % devopsTopics.length];
      qText = `[${track}] In DevOps environments, explain: ${selected.q}.`;
      opt = selected.o;
      ans = selected.a;
    }
    else if (track === 'Cybersecurity') {
      const cyberTopics = [
        { q: 'Asymmetric (Public Key) Cryptography', o: ['Uses one private key only', 'Uses a public key for encryption and a distinct private key for decryption', 'Bypasses algorithm checks', 'Saves plaintext databases'], a: 1 },
        { q: 'SQL Injection mitigation mechanism', o: ['Using plain strings in queries', 'Using parameterized queries/prepared statements and input sanitization', 'Disabling database ports', 'Hashing password variables'], a: 1 },
        { q: 'Zero Trust architecture principal', o: ['Trust but verify', 'Never trust, always verify (requires continuous authentication and micro-segmentation)', 'Trusting internal networks', 'Using complex passwords'], a: 1 },
        { q: 'Cross-Site Scripting (XSS) prevention', o: ['Enforcing firewall gates', 'Escaping output, sanitizing HTML input, and setting Content Security Policies (CSP)', 'Disabling backend cookies', 'Hashing passwords'], a: 1 },
        { q: 'Symmetric vs Asymmetric encryption speed', o: ['Asymmetric is faster', 'Symmetric is much faster and used for bulk data; Asymmetric is slower and used for key exchanges', 'They are identical', 'Encryption speeds are constant'], a: 1 }
      ];
      const selected = cyberTopics[(i - 1) % cyberTopics.length];
      qText = `[${track}] In Cybersecurity frameworks, explain: ${selected.q}.`;
      opt = selected.o;
      ans = selected.a;
    }
    else {
      // General advanced questions for other specializations
      const generalTopics = [
        { q: 'Scale & Performance Optimization', o: ['Increasing code sizes', 'Caching, database indexing, horizontal scaling, and asynchronous processing', 'Static variable allocations', 'Resetting active ports'], a: 1 },
        { q: 'Design Patterns & MVC architecture', o: ['Using one file only', 'Separation of concerns into Model, View, and Controller layers', 'Creating database backups', 'Minifying style sheets'], a: 1 },
        { q: 'Security & Access Control (IAM)', o: ['Public API bindings', 'Role-Based Access Control (RBAC) and Principle of Least Privilege', 'Disabling firewalls', 'Using local variables'], a: 1 },
        { q: 'Data pipeline ETL execution', o: ['Deleting data records', 'Extracting raw data, transforming format/schema, and loading it into target storage', 'Running loops', 'Designing web forms'], a: 1 },
        { q: 'System Design & Load Balancing', o: ['Connecting all clients to one server', 'Distributing incoming application traffic across multiple backend servers to optimize resource use', 'Compressing media files', 'Defining REST endpoints'], a: 1 }
      ];
      const selected = generalTopics[(i - 1) % generalTopics.length];
      qText = `[${track}] Describe the best practice for: ${selected.q}.`;
      opt = selected.o;
      ans = selected.a;
    }

    list.push({
      stack: track,
      questionText: qText,
      options: opt,
      correctAnswer: ans
    });
  }
  questionDatabase[track] = list;
});

// Build the global list of all questions to seed and randomize correct answer positions
const finalQuestionsList = [];
Object.keys(questionDatabase).forEach(key => {
  const items = questionDatabase[key].map(q => {
    const correctAnswerText = q.options[q.correctAnswer];
    
    // Shuffle the options
    const shuffledOptions = [...q.options];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }
    
    const newIndex = shuffledOptions.indexOf(correctAnswerText);
    
    return {
      stack: key,
      questionText: q.questionText,
      options: shuffledOptions,
      correctAnswer: newIndex
    };
  });
  finalQuestionsList.push(...items);
});

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hexaware-portal');
    console.log('MongoDB connected for seeding...');
    
    // Clear existing questions
    await Question.deleteMany();
    console.log('Existing questions removed.');

    // Insert new questions
    await Question.insertMany(finalQuestionsList);
    console.log(`Seeded ${finalQuestionsList.length} questions successfully across all 22 stacks!`);

    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
