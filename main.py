import redis
import sys
import psycopg2

def check_redis_connection():
    try:
        r = redis.Redis(host='localhost', port=6379, decode_responses=True)
        response = r.ping()
        
        if response:
            print("✅ Успешное подключение к Redis")
            print(f"Redis URL: redis://localhost:6379")
        else:
            print("❌ Не удалось подключиться к Redis")
            
    except redis.ConnectionError:
        print("❌ Ошибка подключения к Redis")
        print("Убедитесь, что Redis запущен и доступен")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Произошла ошибка: {str(e)}")
        sys.exit(1)

def check_postgres_connection():
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="sprs",
            user="postgres",
            password="sprs"
        )
        
        cur = conn.cursor()
        cur.execute('SELECT version();')
        version = cur.fetchone()
        
        print("✅ Успешное подключение к PostgreSQL")
        print(f"PostgreSQL версия: {version[0]}")
        
        cur.close()
        conn.close()
        
    except psycopg2.Error as e:
        print("❌ Ошибка подключения к PostgreSQL")
        print(f"Ошибка: {str(e)}")
        sys.exit(1)

def create_sprs_db():
    try:
        # Подключаемся к дефолтной БД postgres для создания новой БД
        conn = psycopg2.connect(
            host="localhost",
            database="sprs",
            user="postgres",
            password="sprs"
        )
        conn.autocommit = True
        cur = conn.cursor()
        
        # Проверяем существование пользователя
        cur.execute("SELECT 1 FROM pg_roles WHERE rolname='sprs'")
        user_exists = cur.fetchone() is not None
        
        # Проверяем существование базы данных
        cur.execute("SELECT 1 FROM pg_database WHERE datname='sprs'")
        db_exists = cur.fetchone() is not None
        
        if user_exists and db_exists:
            print("✅ База данных sprs и пользователь sprs уже существуют")
            print("URL подключения: postgresql://postgres:sprs@localhost:5432/sprs")
        else:
            # Создаем пользователя если не существует
            if not user_exists:
                cur.execute("CREATE USER sprs WITH PASSWORD 'sprs';")
                print("✅ Пользователь sprs создан")
            
            # Создаем БД если не существует
            if not db_exists:
                cur.execute("CREATE DATABASE sprs OWNER sprs;")
                print("✅ База данных sprs создана")
            
            print("URL подключения: postgresql://postgres:sprs@localhost:5432/sprs")

        # Подключаемся к БД sprs для выполнения init.sql
        conn.close()
        conn = psycopg2.connect(
            host="localhost",
            database="sprs",
            user="postgres",
            password="sprs"
        )
        conn.autocommit = True
        cur = conn.cursor()

        # Удаляем все таблицы с префиксом back_
        cur.execute("""
            DO $$ 
            DECLARE
                r RECORD;
            BEGIN
                FOR r IN (SELECT tablename FROM pg_tables WHERE tablename LIKE 'back_%' AND schemaname = current_schema()) 
                LOOP
                    EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
                END LOOP;
            END $$;
        """)
        print("✅ Удалены все таблицы с префиксом back_")

        # Читаем и выполняем SQL скрипт
        with open('back/init.sql', 'r') as file:
            sql_script = file.read()
            cur.execute(sql_script)
            print("✅ SQL скрипт init.sql выполнен успешно")
        
        cur.close()
        conn.close()
        
    except psycopg2.Error as e:
        print("❌ Ошибка при работе с БД")
        print(f"Ошибка: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    check_redis_connection()
    check_postgres_connection()
    create_sprs_db()
