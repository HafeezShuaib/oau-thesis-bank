from sqlalchemy import create_engine,text
class Repository:
    def __init__(self,dsn): self.engine=create_engine(dsn,pool_pre_ping=True)
    def execute_schema(self,path):
        sql=open(path,encoding="utf-8").read()
        with self.engine.begin() as c: c.exec_driver_sql(sql)
