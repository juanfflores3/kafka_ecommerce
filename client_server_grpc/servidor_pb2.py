# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# NO CHECKED-IN PROTOBUF GENCODE
# source: servidor.proto
# Protobuf Python Version: 5.27.2
"""Generated protocol buffer code."""
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import runtime_version as _runtime_version
from google.protobuf import symbol_database as _symbol_database
from google.protobuf.internal import builder as _builder
_runtime_version.ValidateProtobufRuntimeVersion(
    _runtime_version.Domain.PUBLIC,
    5,
    27,
    2,
    '',
    'servidor.proto'
)
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\x0eservidor.proto\x12\x08servidor\"\xb8\x01\n\rPedidoRequest\x12\x17\n\x0fnombre_producto\x18\x01 \x01(\t\x12\x0e\n\x06precio\x18\x02 \x01(\x01\x12\x15\n\rcliente_email\x18\x03 \x01(\t\x12\x13\n\x0bmetodo_pago\x18\x04 \x01(\t\x12\r\n\x05\x62\x61nco\x18\x05 \x01(\t\x12\x14\n\x0ctipo_tarjeta\x18\x06 \x01(\t\x12\r\n\x05\x63\x61lle\x18\x07 \x01(\t\x12\x0e\n\x06numero\x18\x08 \x01(\t\x12\x0e\n\x06region\x18\t \x01(\t\"\x1c\n\tRespuesta\x12\x0f\n\x07mensaje\x18\x01 \x01(\t2K\n\x08Servidor\x12?\n\x0fGestionarPedido\x12\x17.servidor.PedidoRequest\x1a\x13.servidor.Respuestab\x06proto3')

_globals = globals()
_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, _globals)
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'servidor_pb2', _globals)
if not _descriptor._USE_C_DESCRIPTORS:
  DESCRIPTOR._loaded_options = None
  _globals['_PEDIDOREQUEST']._serialized_start=29
  _globals['_PEDIDOREQUEST']._serialized_end=213
  _globals['_RESPUESTA']._serialized_start=215
  _globals['_RESPUESTA']._serialized_end=243
  _globals['_SERVIDOR']._serialized_start=245
  _globals['_SERVIDOR']._serialized_end=320
# @@protoc_insertion_point(module_scope)
